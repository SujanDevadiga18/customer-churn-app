from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd
from pydantic import BaseModel

from .schemas import PredictRequest, PredictResponse
from ..utils.model_loader import load_model
from ..database.schema import Prediction
from ..database.session import get_db
from ..utils.ai_helper import explain_single_customer

router = APIRouter(prefix="/predict", tags=["Prediction"])

# =========================================================
# FULL INPUT PREDICTION
# =========================================================
@router.post("/", response_model=PredictResponse)
def predict(data: PredictRequest, db: Session = Depends(get_db)):

    model = load_model()

    def safe_float(x):
        try:
            return float(x)
        except:
            return 0.0

    try:

        if data.total_charges in ["", " ", None]:
            data.total_charges = data.monthly_charges * data.tenure

        columns = [
            "customerID","gender","SeniorCitizen","Partner","Dependents",
            "tenure","PhoneService","MultipleLines","InternetService",
            "OnlineSecurity","OnlineBackup","DeviceProtection","TechSupport",
            "StreamingTV","StreamingMovies","Contract","PaperlessBilling",
            "PaymentMethod","MonthlyCharges","TotalCharges"
        ]

        row = pd.DataFrame([[

            data.customer_id, data.gender, int(data.senior_citizen),
            data.partner, data.dependents, int(data.tenure),
            data.phone_service, data.multiple_lines, data.internet_service,
            data.online_security, data.online_backup, data.device_protection,
            data.tech_support, data.streaming_tv, data.streaming_movies,
            data.contract, data.paperless_billing, data.payment_method,
            safe_float(data.monthly_charges), safe_float(data.total_charges)

        ]], columns=columns)

        prob = float(model.predict_proba(row)[0][1])
        label = "Likely to Churn" if prob > 0.5 else "Safe Customer"

        explanation = explain_single_customer(row.to_dict(), prob)

        record = Prediction(
            customer_id=data.customer_id,
            tenure=data.tenure,
            monthly_charges=data.monthly_charges,
            contract=data.contract,
            payment_method=data.payment_method, # <--- Added
            probability=prob,
            label=label,
            explanation=explanation,
        )

        db.add(record)
        db.commit()

        return {
            "probability": round(prob, 3),
            "label": label,
            "explanation": explanation
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# SIMPLE (4-FIELD) PREDICTION
# =========================================================

model = load_model()

class SimpleInput(BaseModel):
    customer_id: str
    tenure: int
    contract: str
    monthly_charges: float
    payment_method: str


@router.post("/simple")
def predict_simple(data: SimpleInput, db: Session = Depends(get_db)):

    estimated_total = data.tenure * data.monthly_charges

    defaults = {
        "gender": "Female","SeniorCitizen": 0,"Partner": "No","Dependents": "No",
        "PhoneService": "Yes","MultipleLines": "No","InternetService": "DSL",
        "OnlineSecurity": "No","OnlineBackup": "No","DeviceProtection": "No",
        "TechSupport": "No","StreamingTV": "No","StreamingMovies": "No",
        "PaperlessBilling": "Yes"
    }

    features = {
        **defaults,
        "customerID": data.customer_id,
        "tenure": data.tenure,
        "Contract": data.contract,
        "MonthlyCharges": data.monthly_charges,
        "PaymentMethod": data.payment_method,
        "TotalCharges": round(estimated_total, 2),
    }

    df = pd.DataFrame([features])

    prob = float(model.predict_proba(df)[0][1])
    label = "Likely to Churn" if prob > 0.5 else "Safe Customer"

    explanation = explain_single_customer(df.to_dict(), prob)

    # Save to DB
    try:
        record = Prediction(
            customer_id=data.customer_id,
            tenure=data.tenure,
            monthly_charges=data.monthly_charges,
            contract=data.contract,
            payment_method=data.payment_method,
            probability=prob,
            label=label,
            explanation=explanation,
        )
        db.add(record)
        db.commit()
    except Exception as e:
        print(f"Failed to save prediction: {e}")
        # We don't block the response if saving fails, but good to log

    return {
        "probability": round(prob, 3),
        "label": label,
        "explanation": explanation
    }
