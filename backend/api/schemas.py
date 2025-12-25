from pydantic import BaseModel
from typing import List


class PredictRequest(BaseModel):
    customer_id: str
    gender: str
    senior_citizen: int
    partner: str
    dependents: str
    tenure: int
    phone_service: str
    multiple_lines: str
    internet_service: str
    online_security: str
    online_backup: str
    device_protection: str
    tech_support: str
    streaming_tv: str
    streaming_movies: str
    contract: str
    paperless_billing: str
    payment_method: str
    monthly_charges: float
    total_charges: float


class PredictResponse(BaseModel):
    probability: float
    label: str
    reasons: List[str] = []
