from pydantic import BaseModel
from typing import List


class PredictRequest(BaseModel):
    customer_id: str = "Unknown"
    gender: str = "Female"
    senior_citizen: int = 0
    partner: str = "No"
    dependents: str = "No"
    tenure: int = 0
    phone_service: str = "Yes"
    multiple_lines: str = "No"
    internet_service: str = "DSL"
    online_security: str = "No"
    online_backup: str = "No"
    device_protection: str = "No"
    tech_support: str = "No"
    streaming_tv: str = "No"
    streaming_movies: str = "No"
    contract: str = "Month-to-month"
    paperless_billing: str = "Yes"
    payment_method: str = "Electronic check"
    monthly_charges: float = 0.0
    total_charges: float = 0.0

    class Config:
        extra = "ignore"


class PredictResponse(BaseModel):
    probability: float
    label: str
    reasons: List[str] = []
