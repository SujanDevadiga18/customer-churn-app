import joblib
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "churn_model.pkl"

model = None

def load_model():
    global model
    if model is None:
        model = joblib.load(MODEL_PATH)
    return model
