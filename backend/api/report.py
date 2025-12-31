from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import tempfile

from ..database.session import get_db
from ..database.schema import Prediction
from ..utils.ai_helper import explain_single_customer

router = APIRouter(prefix="/report", tags=["Reports"])


@router.get("/{customer_id}")
def get_report(customer_id: str, db: Session = Depends(get_db)):

    record = (
        db.query(Prediction)
        .filter(Prediction.customer_id == customer_id)
        .order_by(Prediction.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(404, "No prediction found for this customer")

    features = {
        "customer_id": record.customer_id,
        "tenure": record.tenure,
        "contract": record.contract,
        "monthly_charges": record.monthly_charges,
    }

    explanation = explain_single_customer(features, record.probability)

    return {
        "customer_id": record.customer_id,
        "label": record.label,
        "probability": round(record.probability, 3),
        "contract": record.contract,
        "tenure": record.tenure,
        "monthly_charges": record.monthly_charges,
        "explanation": explanation,
        "created_at": record.created_at,
    }


@router.get("/{customer_id}/pdf")
def get_report_pdf(customer_id: str, db: Session = Depends(get_db)):

    record = (
        db.query(Prediction)
        .filter(Prediction.customer_id == customer_id)
        .order_by(Prediction.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(404, "No prediction found")

    styles = getSampleStyleSheet()
    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    doc = SimpleDocTemplate(temp.name)

    story = [
        Paragraph(f"<b>Customer Report — {record.customer_id}</b>", styles["Title"]),
        Spacer(1, 12),
        Paragraph(f"Status: {record.label}", styles["Normal"]),
        Paragraph(f"Probability: {round(record.probability,3)}", styles["Normal"]),
        Paragraph(f"Contract: {record.contract}", styles["Normal"]),
        Paragraph(f"Tenure: {record.tenure} months", styles["Normal"]),
        Paragraph(f"Monthly Charges: {record.monthly_charges}", styles["Normal"]),
        Spacer(1, 12),
        Paragraph("<b>Explanation</b>", styles["Heading2"]),
        Paragraph(explain_single_customer(
            {
                "contract": record.contract,
                "tenure": record.tenure,
                "monthly_charges": record.monthly_charges,
            },
            record.probability,
        ), styles["Normal"])
    ]

    doc.build(story)

    return FileResponse(
        temp.name,
        media_type="application/pdf",
        filename=f"report_{record.customer_id}.pdf",
    )
