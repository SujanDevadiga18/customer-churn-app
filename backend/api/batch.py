from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd

from ..utils.model_loader import load_model
from ..database.session import get_db
from ..database.schema import Prediction

router = APIRouter(prefix="/predict", tags=["Batch Prediction"])


@router.post("/batch")
async def batch_predict(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Please upload a CSV file")

    try:
        df = pd.read_csv(file.file)
    except Exception:
        raise HTTPException(400, "Could not read CSV file")

    required = [
        "gender","SeniorCitizen","Partner","Dependents","tenure","PhoneService",
        "MultipleLines","InternetService","OnlineSecurity","OnlineBackup",
        "DeviceProtection","TechSupport","StreamingTV","StreamingMovies",
        "Contract","PaperlessBilling","PaymentMethod","MonthlyCharges","TotalCharges"
    ]

    missing = [c for c in required if c not in df.columns]
    if missing:
        raise HTTPException(400, f"Missing columns: {missing}")

    model = load_model()

    # ---- build feature frame (COPY) ----
    X = df[required].copy()

    # ---- CLEAN NUMERIC FIELDS (fixes your crash) ----
    X["TotalCharges"] = pd.to_numeric(X["TotalCharges"], errors="coerce").fillna(0)
    X["MonthlyCharges"] = pd.to_numeric(X["MonthlyCharges"], errors="coerce").fillna(0)
    X["tenure"] = pd.to_numeric(X["tenure"], errors="coerce").fillna(0).astype(int)

    # ---- run prediction ----
    probs = model.predict_proba(X)[:, 1]

    results = []

    for i, prob in enumerate(probs):
        label = "Likely to Churn" if prob > 0.5 else "Safe Customer"

        record = Prediction(
            customer_id=str(df["customerID"][i]) if "customerID" in df.columns else None,
            tenure=int(df["tenure"][i]),
            monthly_charges=float(df["MonthlyCharges"][i]),
            contract=str(df["Contract"][i]),
            probability=float(prob),
            label=label
        )

        db.add(record)

        results.append({
            "row": int(i),
            "probability": round(float(prob), 3),
            "label": label
        })

    db.commit()

    return {
        "processed": len(results),
        "results_preview": results[:10],
        "message": "Batch prediction completed"
    }
