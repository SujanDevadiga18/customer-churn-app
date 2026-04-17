from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import tempfile

from database.session import get_db
from database.schema import Prediction, User
from .auth import get_current_user
from utils.ai_helper import explain_single_customer

router = APIRouter(prefix="/report", tags=["Reports"])


@router.get("/{record_id}")
def get_report(record_id: int, db: Session = Depends(get_db)):
    record = db.query(Prediction).filter(Prediction.id == record_id).first()

    if not record:
        raise HTTPException(404, "No prediction found")

    features = {
        "telecom_partner": record.telecom_partner,
        "data_used": record.data_used,
        "tenure_months": record.tenure_months,
        "inactive_days": record.inactive_days,
        "sms_sent": record.sms_sent,
        "calls_made": record.calls_made,
    }

    explanation = explain_single_customer(features, record.probability)

    return {
        "id": record.id,
        "customer_id": record.customer_id,
        "label": record.label,
        "probability": round(record.probability, 3),
        "telecom_partner": record.telecom_partner,
        "data_used": record.data_used,
        "tenure_months": record.tenure_months,
        "inactive_days": record.inactive_days,
        "sms_sent": record.sms_sent,
        "calls_made": record.calls_made,
        "explanation": explanation,
        "created_at": record.created_at,
    }


@router.get("/{record_id}/pdf")
def get_report_pdf(record_id: int, db: Session = Depends(get_db)):
    record = db.query(Prediction).filter(Prediction.id == record_id).first()

    if not record:
        raise HTTPException(404, "No prediction found")

    if not record:
        raise HTTPException(404, "No prediction found")

    styles = getSampleStyleSheet()
    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    doc = SimpleDocTemplate(temp.name)

    # Prepare features for AI explanation
    features = {
        "telecom_partner": record.telecom_partner,
        "data_used": record.data_used,
        "tenure_months": record.tenure_months,
        "inactive_days": record.inactive_days,
        "sms_sent": record.sms_sent,
        "calls_made": record.calls_made,
    }

    story = [
        Paragraph(f"<b>Customer Report — {record.customer_id}</b>", styles["Title"]),
        Spacer(1, 12),
        Paragraph(f"Status: {record.label}", styles["Normal"]),
        Paragraph(f"Probability: {round(record.probability,3)}", styles["Normal"]),
        Paragraph(f"Service Provider: {record.telecom_partner}", styles["Normal"]),
        Paragraph(f"Tenure: {record.tenure_months} Months", styles["Normal"]),
        Paragraph(f"Inactive Days: {record.inactive_days}", styles["Normal"]),
        Paragraph(f"Data Used: {record.data_used} MB", styles["Normal"]),
        Paragraph(f"Calls Made: {record.calls_made}", styles["Normal"]),
        Paragraph(f"SMS Sent: {record.sms_sent}", styles["Normal"]),
        Spacer(1, 12),
        Paragraph("<b>Strategic Analysis & Suggestions</b>", styles["Heading2"]),
        Paragraph(explain_single_customer(features, record.probability), styles["Normal"])
    ]

    doc.build(story)

    return FileResponse(
        temp.name,
        media_type="application/pdf",
        filename=f"report_{record.customer_id}.pdf",
    )
