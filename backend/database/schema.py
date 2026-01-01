from sqlalchemy import Column, Integer, String, Float, DateTime, func
from .db import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, nullable=True)
    tenure = Column(Integer)
    monthly_charges = Column(Float)
    contract = Column(String)
    payment_method = Column(String) # <--- Added
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
