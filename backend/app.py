from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .database.db import Base, engine
from .api import predict, history, batch, analytics, report

# Load .env for AI API key
load_dotenv()

app = FastAPI(title="Customer Churn API")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://customer-churn-app-one.vercel.app",
        "https://churn-backend-7ge1.onrender.com",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
app.include_router(history.router)
app.include_router(batch.router)
app.include_router(analytics.router)
app.include_router(report.router)

@app.get("/")
def root():
    return {"message": "Churn API running"}
