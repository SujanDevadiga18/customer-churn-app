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

    for col in required:
        if col not in df.columns:
            df[col] = defaults.get(col, None)
            auto_filled.append(col)

    for c in df.select_dtypes(include="object").columns:
        df[c] = df[c].fillna("").astype(str).str.strip()

    X = df[required].copy()

    X["MonthlyCharges"] = pd.to_numeric(X["MonthlyCharges"], errors="coerce").fillna(0)
    X["tenure"] = pd.to_numeric(X["tenure"], errors="coerce").fillna(0).astype(int)
    X["TotalCharges"] = pd.to_numeric(X["TotalCharges"], errors="coerce").fillna(
        X["MonthlyCharges"] * X["tenure"]
    )

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
