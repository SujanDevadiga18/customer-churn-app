from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from database.schema import Prediction, User
from .auth import get_current_user

router = APIRouter(prefix="/clear", tags=["Clear"])

@router.delete("/all")
def clear_all_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        if current_user.role == "admin":
            num_deleted = db.query(Prediction).delete()
        else:
            num_deleted = db.query(Prediction).filter(Prediction.user_id == current_user.id).delete()
        db.commit()
        return {"message": f"Successfully deleted {num_deleted} records."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
