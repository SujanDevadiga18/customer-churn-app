from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database.session import get_db
from database.schema import Prediction, User
from .auth import get_current_user

router = APIRouter(prefix="/history", tags=["History"])

@router.get("/")
def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skip = (page - 1) * limit
    
    query = db.query(Prediction)
    if current_user.role != "admin":
        query = query.filter(Prediction.user_id == current_user.id)

    records = (
        query
        .order_by(Prediction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    total = query.count()

    serialized = [
        {
            "id": r.id,
            "customer_id": r.customer_id,
            "contract": r.contract,
            "probability": round(r.probability, 3),
            "label": r.label,
            "created_at": r.created_at
        }
        for r in records
    ]

    print("RECORDS >>>", serialized)   # 👈 DEBUG

    return {
        "page": page,
        "limit": limit,
        "total_records": total,
        "records": serialized
    }


@router.delete("/{record_id}")
def delete_history_record(record_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Prediction).filter(Prediction.id == record_id)
    if current_user.role != "admin":
        query = query.filter(Prediction.user_id == current_user.id)

    deleted = query.delete()
    db.commit()

    if not deleted:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Record not found")

    return {"message": "Record deleted"}


@router.get("/{customer_id}")
def get_history_detail(customer_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Prediction).filter(Prediction.customer_id == customer_id)
    if current_user.role != "admin":
        query = query.filter(Prediction.user_id == current_user.id)
        
    record = (
        query
        .order_by(Prediction.created_at.desc())
        .first()
    )

    if not record:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Prediction not found")

    return {
        "id": record.id,
        "customer_id": record.customer_id,
        "contract": record.contract,
        "tenure": record.tenure,
        "monthly_charges": record.monthly_charges,
        "probability": round(record.probability, 3),
        "label": record.label,
        "explanation": record.explanation,
        "created_at": record.created_at
    }


