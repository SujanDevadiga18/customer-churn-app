from sqlalchemy import Column, Integer, String, Float, DateTime, func
from .db import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, nullable=True)
    tenure = Column(Integer)
    monthly_charges = Column(Float)
    contract = Column(String)
    probability = Column(Float)
    label = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
