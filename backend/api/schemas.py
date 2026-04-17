from pydantic import BaseModel, EmailStr, field_validator
import re
from typing import List


class PredictRequest(BaseModel):
    customer_id: str = "Unknown"
    telecom_partner: str = "Reliance Jio"
    data_used: int = 5000
    tenure_months: int = 12
    inactive_days: int = 5
    sms_sent: int = 50
    calls_made: int = 50

    class Config:
        extra = "ignore"


class PredictResponse(BaseModel):
    probability: float
    label: str
    reasons: List[str] = []


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("password")
    def password_complexity(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search("[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search("[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search("[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search("[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

class OTPVerify(BaseModel):
    email: str
    code: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
