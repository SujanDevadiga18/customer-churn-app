import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score
import joblib
from pathlib import Path

# ----- LOAD DATA -----
df = pd.read_csv("backend/data/telecom_churn_final.csv")

# Target
y = df["churn"]
# Keep only specified features
features = ["telecom_partner", "data_used", "tenure_months", "inactive_days", "sms_sent", "calls_made"]
X = df[features]

# Feature groups
numeric = ["data_used", "tenure_months", "inactive_days", "sms_sent", "calls_made"]
categorical = ["telecom_partner"]

preprocess = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
        ("num", StandardScaler(), numeric),
    ]
)

model = Pipeline(
    steps=[
        ("preprocess", preprocess),
        ("clf", RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)),
    ]
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model.fit(X_train, y_train)

pred = model.predict_proba(X_test)[:, 1]
print("ROC AUC:", roc_auc_score(y_test, pred))

Path("backend/models").mkdir(exist_ok=True)
joblib.dump(model, "backend/models/churn_model.pkl")

print("Model saved!")
