from fastapi import FastAPI
from .database.db import Base, engine
from .api import predict, history
from .api import batch
from fastapi.middleware.cors import CORSMiddleware
from .api import analytics
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Customer Churn API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(predict.router)
app.include_router(history.router)
app.include_router(batch.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {"message": "Churn API running"}
