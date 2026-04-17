from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd
import io

from utils.model_loader import load_model
from database.session import get_db
from database.schema import Prediction
from utils.ai_helper import summarize_batch

router = APIRouter(prefix="/batch", tags=["Batch Prediction"])


@router.post("/upload")
async def batch_predict(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    download: bool = Query(False)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Please upload a CSV file")

    try:
        df = pd.read_csv(file.file)
    except Exception:
        raise HTTPException(400, "Could not read CSV file")

    required = [
        "telecom_partner", "data_used", "tenure_months",
        "inactive_days", "sms_sent", "calls_made"
    ]

    # Flexible column name mapping
    mapping = {
        "service provider": "telecom_partner",
        "provider": "telecom_partner",
        "monthly_data_usage": "data_used",
        "sms sent": "sms_sent",
        "call made": "calls_made"
    }
    df.rename(columns={k: v for k, v in mapping.items() if k in df.columns}, inplace=True)

    defaults = {
        "telecom_partner": "Reliance Jio",
        "data_used": 0,
        "tenure_months": 1,
        "inactive_days": 0,
        "sms_sent": 0,
        "calls_made": 0
    }

    auto_filled = []
    for col in required:
        if col not in df.columns:
            df[col] = defaults.get(col, None)
            auto_filled.append(col)

    X = df[required].copy()
    for col in ["data_used", "tenure_months", "inactive_days", "sms_sent", "calls_made"]:
        X[col] = pd.to_numeric(X[col], errors="coerce").fillna(defaults[col]).astype(int)

    model = load_model()
    probs = model.predict_proba(X)[:, 1]

    df["churn_probability"] = probs

    def get_label(p):
        if p > 0.7: return "Likely to Churn"
        if p > 0.4: return "Maybe"
        return "Safe"

    df["prediction_label"] = df["churn_probability"].apply(get_label)

    results = []
    records_to_save = []

    for i, prob in enumerate(probs):
        label = df["prediction_label"].iloc[i]

        cid_col = None
        for col_name in ["customer_id", "customerID", "CustomerID", "Customer_ID"]:
            if col_name in df.columns:
                cid_col = col_name
                break
        cid_val = str(df[cid_col].iloc[i]) if cid_col else f"BATCH-{i+1}"

        record = Prediction(
            user_id=1,  # default since auth removed
            customer_id=cid_val,
            telecom_partner=str(X["telecom_partner"].iloc[i]),
            data_used=int(X["data_used"].iloc[i]),
            tenure_months=int(X["tenure_months"].iloc[i]),
            inactive_days=int(X["inactive_days"].iloc[i]),
            sms_sent=int(X["sms_sent"].iloc[i]),
            calls_made=int(X["calls_made"].iloc[i]),
            probability=float(prob),
            label=label,
        )
        records_to_save.append(record)

        results.append({
            "row": int(i),
            "customer_id": cid_val,
            "probability": round(float(prob), 3),
            "label": label
        })

    # Bulk Insert
    db.bulk_save_objects(records_to_save)
    db.commit()

    total_customers = len(results)
    churned_customers = sum(1 for r in results if r["label"] == "Likely to Churn")
    maybe_customers = sum(1 for r in results if r["label"] == "Maybe")
    safe_customers = sum(1 for r in results if r["label"] == "Safe")

    stats = {
        "total_rows": total_customers,
        "likely_churn": churned_customers,
        "migration_potential": maybe_customers,
        "safe": safe_customers,
        "churn_rate": round(churned_customers / total_customers * 100, 1) if total_customers > 0 else 0
    }

    try:
        summary = summarize_batch(stats)
    except Exception as e:
        print(f"AI Batch Summary Error: {e}")
        summary = f"Batch Analysis: {churned_customers} customers are at high churn risk and {maybe_customers} are in the moderate risk zone."

    if download:
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)
        return StreamingResponse(
            buffer,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=churn_predictions.csv"},
        )

    return {
        "total_processed": total_customers,
        "high_risk_count": churned_customers,
        "maybe_count": maybe_customers,
        "safe_count": safe_customers,
        "avg_churn": round(churned_customers / total_customers, 3) if total_customers > 0 else 0,
        "results_preview": results[:30],
        "summary": summary,
        "auto_filled_columns": auto_filled,
        "message": "Batch prediction completed successfully."
    }
