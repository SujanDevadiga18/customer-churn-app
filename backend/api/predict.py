from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd
from pydantic import BaseModel

from .schemas import PredictRequest, PredictResponse
from utils.model_loader import load_model
from database.session import get_db
from database.schema import Prediction
from utils.ai_helper import explain_single_customer

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("/", response_model=PredictResponse)
def predict(data: PredictRequest, db: Session = Depends(get_db)):
    model = load_model()
    try:
        columns = [
            "telecom_partner", "data_used", "tenure_months",
            "inactive_days", "sms_sent", "calls_made"
        ]
        row = pd.DataFrame([[
            data.telecom_partner, data.data_used, data.tenure_months,
            data.inactive_days, data.sms_sent, data.calls_made
        ]], columns=columns)

        prob = float(model.predict_proba(row)[0][1])
        
        if prob > 0.7:
            label = "Likely to Churn"
        elif prob > 0.4:
            label = "Maybe"
        else:
            label = "Safe"

        explanation = explain_single_customer(data.dict(), prob)

        record = Prediction(
            user_id=1,  # default user since auth removed
            customer_id=data.customer_id,
            telecom_partner=data.telecom_partner,
            data_used=data.data_used,
            tenure_months=data.tenure_months,
            inactive_days=data.inactive_days,
            sms_sent=data.sms_sent,
            calls_made=data.calls_made,
            probability=prob,
            label=label,
            explanation=explanation,
        )
        db.add(record)
        db.commit()

        return {
            "probability": round(prob, 3),
            "label": label,
            "reasons": [explanation] if explanation else [],
        }

    except Exception as e:
        db.rollback()
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
