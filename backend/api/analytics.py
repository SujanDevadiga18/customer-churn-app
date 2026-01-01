from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.session import get_db
from ..database.schema import Prediction
from sqlalchemy import func

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
def analytics_summary(db: Session = Depends(get_db)):

    total = db.query(Prediction).count()

    high_risk_query = db.query(Prediction).filter(Prediction.probability > 0.5)
    high_risk = high_risk_query.count()

    # Calculate Revenue at Risk (Sum of MonthlyCharges for likely churners)
    revenue_at_risk = db.query(func.sum(Prediction.monthly_charges)).filter(Prediction.probability > 0.5).scalar() or 0.0

    churn_rate = (high_risk / total) * 100 if total else 0

    return {
        "total_predictions": total,
        "high_risk_customers": high_risk,
        "revenue_at_risk": round(revenue_at_risk, 2),
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


@router.get("/scatter_data")
def scatter_data(db: Session = Depends(get_db)):
    # Sample 500 points for performance
    rows = (
        db.query(Prediction.tenure, Prediction.monthly_charges, Prediction.probability, Prediction.label)
        .limit(500)
        .all()
    )
    return [
        {
            "tenure": r.tenure,
            "monthly_charges": r.monthly_charges,
            "probability": round(r.probability, 3),
            "label": r.label
        }
        for r in rows
    ]


@router.get("/trend_by_tenure")
def trend_by_tenure(db: Session = Depends(get_db)):
    # Get granular data first
    raw_results = (
        db.query(Prediction.tenure, func.avg(Prediction.monthly_charges).label("avg_charges"))
        .group_by(Prediction.tenure)
        .order_by(Prediction.tenure)
        .all()
    )
    
    # Bin into 6-month intervals in Python
    # e.g., 1-6, 7-12, 13-18...
    bins = {}
    
    for r in raw_results:
        if r.tenure == 0: continue # Skip 0 tenure if exists
        
        # Calculate bucket index (0 for 1-6, 1 for 7-12, etc.)
        bucket_idx = (r.tenure - 1) // 6
        bucket_label = f"{bucket_idx * 6 + 1}-{bucket_idx * 6 + 6}m"
        
        if bucket_label not in bins:
            bins[bucket_label] = {"sum": 0, "count": 0, "sort_key": bucket_idx}
            
        bins[bucket_label]["sum"] += r.avg_charges
        bins[bucket_label]["count"] += 1
        
    # Average the buckets
    output = []
    for label, data in bins.items():
        output.append({
            "tenure": label,
            "avg_charges": round(data["sum"] / data["count"], 2),
            "_sort": data["sort_key"]
        })
        
    # Sort by time
    output.sort(key=lambda x: x["_sort"])
    
    return [{"tenure": x["tenure"], "avg_charges": x["avg_charges"]} for x in output]

@router.get("/payment_stats")
def payment_stats(db: Session = Depends(get_db)):
    rows = db.query(Prediction).all()
    
    stats = {}
    
    for r in rows:
        # Check if payment_method column exists/is populated. 
        # Since we just added it, old rows might have None. Handle gracefully.
        pm = r.payment_method or "Unknown"
        if pm not in stats:
            stats[pm] = {"churn": 0, "total": 0}
            
        stats[pm]["total"] += 1
        if r.label == "Likely to Churn":
            stats[pm]["churn"] += 1
            
    output = []
    for k, v in stats.items():
        churn_rate = (v["churn"] / v["total"]) * 100 if v["total"] else 0
        output.append({
            "name": k,
            "value": v["total"], 
            "churn_rate": round(churn_rate, 2)
        })
        
    return output
