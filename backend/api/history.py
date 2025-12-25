from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.session import get_db
from ..database.schema import Prediction

router = APIRouter(prefix="/history", tags=["History"])

@router.get("/")
def get_history(db: Session = Depends(get_db)):
    records = db.query(Prediction).order_by(Prediction.created_at.desc()).all()
    return records
