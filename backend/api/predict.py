from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd

from .schemas import PredictRequest, PredictResponse
from ..utils.model_loader import load_model
from ..database.schema import Prediction
from ..database.session import get_db

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("/", response_model=PredictResponse)
def predict(data: PredictRequest, db: Session = Depends(get_db)):
    model = load_model()

    def safe_float(x):
        try:
            return float(x)
        except Exception:
            return 0.0

    try:
        if data.total_charges in ["", " ", None]:
            data.total_charges = data.monthly_charges * data.tenure

        columns = [
            "customerID",
            "gender",
            "SeniorCitizen",
            "Partner",
            "Dependents",
            "tenure",
            "PhoneService",
            "MultipleLines",
            "InternetService",
            "OnlineSecurity",
            "OnlineBackup",
            "DeviceProtection",
            "TechSupport",
            "StreamingTV",
            "StreamingMovies",
            "Contract",
            "PaperlessBilling",
            "PaymentMethod",
            "MonthlyCharges",
            "TotalCharges"
        ]

        row = pd.DataFrame([[
            data.customer_id,
            data.gender,
            int(data.senior_citizen),
            data.partner,
            data.dependents,
            int(data.tenure),
            data.phone_service,
            data.multiple_lines,
            data.internet_service,
            data.online_security,
            data.online_backup,
            data.device_protection,
            data.tech_support,
            data.streaming_tv,
            data.streaming_movies,
            data.contract,
            data.paperless_billing,
            data.payment_method,
            safe_float(data.monthly_charges),
            safe_float(data.total_charges)
        ]], columns=columns)

        # ---------------- DEBUG (DO NOT REMOVE YET) ----------------
        print("\n--- DEBUG DF TYPES ---")
        print(row.dtypes)
        print(row)
        print("----------------------\n")
        # -----------------------------------------------------------

        prob = model.predict_proba(row)[0][1]
        label = "Likely to Churn" if prob > 0.5 else "Safe Customer"

        record = Prediction(
            customer_id=data.customer_id,
            tenure=data.tenure,
            monthly_charges=data.monthly_charges,
            contract=data.contract,
            probability=float(prob),
            label=label
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        return PredictResponse(
            probability=round(float(prob), 3),
            label=label,
            reasons=[]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
