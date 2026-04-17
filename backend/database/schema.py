from sqlalchemy import Column, Integer, String, Float, DateTime, func, Boolean
from .db import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    customer_id = Column(String, nullable=True)
    telecom_partner = Column(String)
    data_used = Column(Integer)
    tenure_months = Column(Integer)
    inactive_days = Column(Integer)
    sms_sent = Column(Integer)
    calls_made = Column(Integer)
    probability = Column(Float)
    label = Column(String)
    explanation = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True) # Added email
    hashed_password = Column(String)
    role = Column(String, default="user")  # "admin" or "user"
    is_verified = Column(Boolean, default=False)
    otp_code = Column(String, nullable=True)
    otp_expiry = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
