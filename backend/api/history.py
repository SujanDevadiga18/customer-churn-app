from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from database.schema import Prediction

router = APIRouter(prefix="/history", tags=["History"])

@router.delete("/all")
def delete_all_history(db: Session = Depends(get_db)):
    db.query(Prediction).delete()
    db.commit()
    return {"message": "All prediction history cleared."}

@router.get("/")
def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    query = db.query(Prediction)
    records = query.order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": r.id,
            "customer_id": r.customer_id,
            "telecom_partner": r.telecom_partner,
            "data_used": r.data_used,
            "probability": round(r.probability, 3) if r.probability is not None else 0,
            "label": r.label,
            "created_at": r.created_at
        }
        for r in records
    ]

# ─── Lookup by numeric primary key (used by Report page) ──────────────────────
@router.get("/id/{record_id}")
def get_by_id(record_id: int, db: Session = Depends(get_db)):
    record = db.query(Prediction).filter(Prediction.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return _serialize(record)

# ─── Lookup by string customer_id ─────────────────────────────────────────────
@router.get("/{customer_id}")
def get_history_detail(customer_id: str, db: Session = Depends(get_db)):
    record = db.query(Prediction).filter(Prediction.customer_id == customer_id)\
        .order_by(Prediction.created_at.desc()).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return _serialize(record)

@router.delete("/{record_id}")
def delete_history_record(record_id: int, db: Session = Depends(get_db)):
    deleted = db.query(Prediction).filter(Prediction.id == record_id).delete()
    db.commit()
    if not deleted:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Record deleted"}

def _serialize(record):
    return {
        "id": record.id,
        "customer_id": record.customer_id,
        "telecom_partner": record.telecom_partner,
        "data_used": record.data_used,
        "calls_made": record.calls_made,
        "sms_sent": record.sms_sent,
        "tenure_months": record.tenure_months,
        "inactive_days": record.inactive_days,
        "probability": round(record.probability, 3) if record.probability else 0,
        "label": record.label,
        "explanation": record.explanation,
        "created_at": record.created_at
    }
