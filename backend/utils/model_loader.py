import joblib
from pathlib import Path

MODEL_PATH = Path("backend/models/knn.pkl")

model = None

def load_model():
    global model
    if model is None:
        model = joblib.load(MODEL_PATH)
    return model
