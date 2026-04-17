from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from database.schema import Prediction
from sqlalchemy import func

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
def analytics_summary(db: Session = Depends(get_db)):
    total = db.query(func.count(Prediction.id)).scalar() or 0
    # Use probability > 0.5 as the churn threshold (matches "Likely to Churn" + "Maybe")
    churn_count = db.query(func.count(Prediction.id)).filter(Prediction.probability > 0.5).scalar() or 0
    churn_rate = (churn_count / total * 100) if total > 0 else 0
    revenue_at_risk = churn_count * 60
    return {
        "total_predictions": total,
        "churn_rate": round(churn_rate, 1),
        "revenue_at_risk": revenue_at_risk
    }

@router.get("/probability_distribution")
def probability_distribution(db: Session = Depends(get_db)):
    query = db.query(
        func.count(Prediction.id).filter(Prediction.probability <= 0.2).label("b1"),
        func.count(Prediction.id).filter(Prediction.probability > 0.2, Prediction.probability <= 0.4).label("b2"),
        func.count(Prediction.id).filter(Prediction.probability > 0.4, Prediction.probability <= 0.6).label("b3"),
        func.count(Prediction.id).filter(Prediction.probability > 0.6, Prediction.probability <= 0.8).label("b4"),
        func.count(Prediction.id).filter(Prediction.probability > 0.8).label("b5")
    )
    r = query.one()
    return [
        {"bucket": "0–20%", "count": r.b1},
        {"bucket": "20–40%", "count": r.b2},
        {"bucket": "40–60%", "count": r.b3},
        {"bucket": "60–80%", "count": r.b4},
        {"bucket": "80–100%", "count": r.b5}
    ]

@router.get("/provider_stats")
def provider_stats(db: Session = Depends(get_db)):
    results = db.query(
        Prediction.telecom_partner,
        func.count(Prediction.id).label("total"),
        func.count(Prediction.id).filter(Prediction.probability > 0.5).label("churn")
    ).group_by(Prediction.telecom_partner).all()
    return [{
        "name": r.telecom_partner or "Unknown",
        "churn_rate": round((r.churn / r.total * 100), 1) if r.total > 0 else 0,
        "total_users": r.total
    } for r in results]

@router.get("/payment_stats")
def payment_stats(db: Session = Depends(get_db)):
    results = db.query(Prediction.telecom_partner, func.count(Prediction.id)).group_by(Prediction.telecom_partner).all()
    return [{"name": r[0] or "Unknown", "value": r[1]} for r in results]

@router.get("/trend_by_tenure")
def trend_by_tenure(db: Session = Depends(get_db)):
    results = db.query(Prediction.tenure_months, func.avg(Prediction.data_used)).group_by(Prediction.tenure_months).all()
    buckets = {}
    for r in results:
        t = r[0] or 1
        group = f"{((t-1)//6)*6+1}-{((t-1)//6+1)*6}m"
        if group not in buckets:
            buckets[group] = []
        buckets[group].append(float(r[1]) / 10 if r[1] else 50)
    return [{"tenure": k, "avg_charges": round(sum(v)/len(v), 1)} for k, v in buckets.items()]

@router.get("/top_risk")
def get_top_risk(db: Session = Depends(get_db)):
    rows = db.query(Prediction).filter(Prediction.probability > 0.5).order_by(Prediction.probability.desc()).limit(10).all()
    return [{
        "customer_id": r.customer_id,
        "probability": r.probability,
        "label": r.label,
        "telecom_partner": r.telecom_partner,
        "explanation": r.explanation
    } for r in rows]
