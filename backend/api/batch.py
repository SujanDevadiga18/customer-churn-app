from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd
import io

from utils.model_loader import load_model
from database.session import get_db
from database.schema import Prediction, User
from .auth import get_current_user
from utils.ai_helper import summarize_batch

router = APIRouter(prefix="/predict", tags=["Batch Prediction"])


@router.post("/batch")
async def batch_predict(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    download: bool = Query(False)
):
    # ----------- FILE CHECK -----------
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Please upload a CSV file")

    try:
        df = pd.read_csv(file.file)
    except Exception:
        raise HTTPException(400, "Could not read CSV file")

    # ----------- REQUIRED COLUMNS -----------
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

    # ----------- FILL MISSING COLUMNS -----------
    for col in required:
        if col not in df.columns:
            df[col] = defaults.get(col, None)
            auto_filled.append(col)

    # ----------- CLEAN CATEGORICAL DATA -----------
    cat_cols = [c for c in required if c in df.columns and df[c].dtype == 'object']
    for c in cat_cols:
        default_val = defaults.get(c, "No")
        df[c] = df[c].fillna(default_val).astype(str).str.strip()

    X = df[required].copy()

    # ----------- CLEAN NUMERIC DATA -----------
    X["SeniorCitizen"] = pd.to_numeric(X["SeniorCitizen"], errors="coerce").fillna(0).astype(int)
    X["tenure"] = pd.to_numeric(X["tenure"], errors="coerce").fillna(0).astype(int)
    X["MonthlyCharges"] = pd.to_numeric(X["MonthlyCharges"], errors="coerce").fillna(0.0)

    X["TotalCharges"] = pd.to_numeric(X["TotalCharges"], errors="coerce")
    mask_nan_total = X["TotalCharges"].isna()
    X.loc[mask_nan_total, "TotalCharges"] = X.loc[mask_nan_total, "MonthlyCharges"] * X.loc[mask_nan_total, "tenure"]
    X["TotalCharges"] = X["TotalCharges"].fillna(0.0)

    # ----------- MODEL PREDICTION -----------
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
                user_id=current_user.id,
                customer_id=str(df["customerID"][i]),
                tenure=int(X["tenure"][i]),
                monthly_charges=float(X["MonthlyCharges"][i]),
                contract=str(X["Contract"][i]),
                payment_method=str(X["PaymentMethod"][i]),
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

    # ----------- CALCULATE CHURN METRICS (FIX) -----------
    total_customers = len(results)
    churned_customers = sum(r["label"] == "Likely to Churn" for r in results)
    safe_customers = sum(r["label"] == "Safe Customer" for r in results)

    churn_rate = round((churned_customers / total_customers) * 100, 2) if total_customers > 0 else 0

    stats = {
        "total_rows": total_customers,
        "likely_churn": churned_customers,
        "safe": safe_customers,
        "churn_rate": churn_rate
    }

    # ----------- AI SUMMARY (CRITICAL FIX: Graceful Failure) -----------
    try:
        summary = summarize_batch(stats)
    except Exception as e:
        print(f"AI Batch Summary Error: {e}")
        summary = "AI analysis temporarily unavailable for this batch."

    # ----------- CSV DOWNLOAD MODE -----------
    if download:
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=churn_predictions.csv"},
        )

    # ----------- FINAL RESPONSE -----------
    return {
        "processed": total_customers,
        "churned_customers": churned_customers,
        "churn_rate": churn_rate,
        "results_preview": results[:10],
        "summary": summary,
        "auto_filled_columns": auto_filled,
        "message": "Batch prediction completed successfully."
    }
