from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.session import get_db
from ..database.schema import Prediction
from .auth import require_admin

router = APIRouter(prefix="/clear", tags=["Clear"])

@router.delete("/all", dependencies=[Depends(require_admin)])
def clear_all_history(db: Session = Depends(get_db)):
    try:
        num_deleted = db.query(Prediction).delete()
        db.commit()
        return {"message": f"Successfully deleted {num_deleted} records."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
