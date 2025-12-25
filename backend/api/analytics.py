from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.session import get_db
from ..database.schema import Prediction
from sqlalchemy import func

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
def analytics_summary(db: Session = Depends(get_db)):

    total = db.query(Prediction).count()

    high_risk = db.query(Prediction).filter(Prediction.probability > 0.5).count()

    avg_prob = db.query(func.avg(Prediction.probability)).scalar() or 0

    churn_rate = (high_risk / total) * 100 if total else 0

    return {
        "total_predictions": total,
        "high_risk_customers": high_risk,
        "average_probability": round(avg_prob, 3),
        "churn_rate": round(churn_rate, 2)
    }

@router.get("/probability_distribution")
def probability_distribution(db: Session = Depends(get_db)):
    probs = [p.probability for p in db.query(Prediction).all()]

    buckets = [
        {"bucket": "0–0.2", "count": 0},
        {"bucket": "0.2–0.4", "count": 0},
        {"bucket": "0.4–0.6", "count": 0},
        {"bucket": "0.6–0.8", "count": 0},
        {"bucket": "0.8–1.0", "count": 0},
    ]

    for p in probs:
        if p <= 0.2: buckets[0]["count"] += 1
        elif p <= 0.4: buckets[1]["count"] += 1
        elif p <= 0.6: buckets[2]["count"] += 1
        elif p <= 0.8: buckets[3]["count"] += 1
        else: buckets[4]["count"] += 1

    return buckets

@router.get("/churn_by_contract")
def churn_by_contract(db: Session = Depends(get_db)):

    rows = db.query(Prediction).all()

    result = {
        "Month-to-month": {"churn": 0, "total": 0},
        "One year": {"churn": 0, "total": 0},
        "Two year": {"churn": 0, "total": 0},
    }

    for r in rows:
        if r.contract not in result:
            continue

        result[r.contract]["total"] += 1

        if r.label == "Likely to Churn":
            result[r.contract]["churn"] += 1

    # convert to chart-friendly format
    output = []
    for k, v in result.items():
        churn_rate = (v["churn"] / v["total"]) * 100 if v["total"] else 0
        output.append({"contract": k, "churn_rate": round(churn_rate, 2)})

    return output

@router.get("/top_risk")
def top_risk(db: Session = Depends(get_db)):

    rows = (
        db.query(Prediction)
        .order_by(Prediction.probability.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "customer_id": r.customer_id,
            "probability": round(r.probability, 3),
            "contract": r.contract,
            "tenure": r.tenure,
            "label": r.label
        }
        for r in rows
    ]

