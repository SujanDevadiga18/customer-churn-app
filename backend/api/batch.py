from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd
import io

from ..utils.model_loader import load_model
from ..database.session import get_db
from ..database.schema import Prediction
from ..utils.ai_helper import summarize_batch

router = APIRouter(prefix="/predict", tags=["Batch Prediction"])


@router.post("/batch")
async def batch_predict(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    download: bool = Query(False)    # << NEW toggle
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Please upload a CSV file")

    try:
        df = pd.read_csv(file.file)
    except Exception:
        raise HTTPException(400, "Could not read CSV file")

    required = [
        "customerID","gender","SeniorCitizen","Partner","Dependents","tenure",
        "PhoneService","MultipleLines","InternetService","OnlineSecurity",
        "OnlineBackup","DeviceProtection","TechSupport","StreamingTV",
        "StreamingMovies","Contract","PaperlessBilling","PaymentMethod",
        "MonthlyCharges","TotalCharges"
    ]

    defaults = {
        "gender":"Female","SeniorCitizen":0,"Partner":"No","Dependents":"No",
        "tenure":0,"PhoneService":"Yes","MultipleLines":"No","InternetService":"DSL",
        "OnlineSecurity":"No","OnlineBackup":"No","DeviceProtection":"No",
        "TechSupport":"No","StreamingTV":"No","StreamingMovies":"No",
        "PaperlessBilling":"Yes","TotalCharges":0
    }

    auto_filled = []

    # 1. Fill missing columns with defaults
    for col in required:
        if col not in df.columns:
            df[col] = defaults.get(col, None)
            auto_filled.append(col)

    # 2. Robust NaN filling for Categorical columns
    # Select object columns that are in 'required' to avoid touching extra columns unnecessarily, 
    # OR just touch everything relevant.
    cat_cols = [c for c in required if c in df.columns and df[c].dtype == 'object']
    for c in cat_cols:
        # Fill NaN with empty string or mode-like default? 
        # The model likely expects "No", "DSL" etc. Empty string might be treated as new category.
        # Let's fill with defaults entry if available, else "No".
        default_val = defaults.get(c, "No")
        df[c] = df[c].fillna(default_val).astype(str).str.strip()

    X = df[required].copy()

    # 3. Robust NaN filling for Numeric columns
    X["SeniorCitizen"] = pd.to_numeric(X["SeniorCitizen"], errors="coerce").fillna(0).astype(int)
    X["tenure"] = pd.to_numeric(X["tenure"], errors="coerce").fillna(0).astype(int)
    X["MonthlyCharges"] = pd.to_numeric(X["MonthlyCharges"], errors="coerce").fillna(0.0)
    
    # Calculate TotalCharges cleanly
    # First coerce existing TotalCharges
    X["TotalCharges"] = pd.to_numeric(X["TotalCharges"], errors="coerce")
    # Then fill NaNs with Monthly * Tenure
    mask_nan_total = X["TotalCharges"].isna()
    X.loc[mask_nan_total, "TotalCharges"] = X.loc[mask_nan_total, "MonthlyCharges"] * X.loc[mask_nan_total, "tenure"]
    # Final cleanup just in case
    X["TotalCharges"] = X["TotalCharges"].fillna(0.0)

    model = load_model()
    probs = model.predict_proba(X)[:, 1]

    df["churn_probability"] = probs
    df["prediction_label"] = (df["churn_probability"] > 0.5).map(
        {True: "Likely to Churn", False: "Safe Customer"}
    )

    results = []

    for i, prob in enumerate(probs):
        label = df["prediction_label"][i]

        db.add(
            Prediction(
                customer_id=str(df["customerID"][i]),
                tenure=int(X["tenure"][i]),
                monthly_charges=float(X["MonthlyCharges"][i]),
                contract=str(X["Contract"][i]),
                payment_method=str(X["PaymentMethod"][i]), # <--- Added
                probability=float(prob),
                label=label,
            )
        )

        results.append({
            "row": int(i),
            "customer_id": str(df["customerID"][i]),
            "probability": round(float(prob), 3),
            "label": label
        })

    db.commit()

    # ---------- AI SUMMARY ----------
    stats = {
        "total_rows": len(results),
        "likely_churn": int(sum(r["label"] == "Likely to Churn" for r in results)),
        "safe": int(sum(r["label"] == "Safe Customer" for r in results)),
    }

    summary = summarize_batch(stats)

    # ---------- CSV DOWNLOAD MODE ----------
    if download:
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=churn_predictions.csv"},
        )

    # ---------- NORMAL JSON RESPONSE ----------
    return {
        "processed": len(results),
        "results_preview": results[:10],
        "summary": summary,
        "auto_filled_columns": auto_filled,
        "message": "Batch prediction completed successfully."
    }
