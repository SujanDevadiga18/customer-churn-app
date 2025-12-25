import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import roc_auc_score
import joblib
from pathlib import Path

# ----- LOAD DATA -----
df = pd.read_csv("backend/data/churn.csv")

# Fix TotalCharges
df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
df["TotalCharges"] = df["TotalCharges"].fillna(0)

# Drop ID column (important!)
df = df.drop(columns=["customerID"])

# Target
y = df["Churn"].map({"Yes": 1, "No": 0})
X = df.drop(columns=["Churn"])

# Feature groups
numeric = ["SeniorCitizen", "tenure", "MonthlyCharges", "TotalCharges"]
categorical = [c for c in X.columns if c not in numeric]

preprocess = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
        ("num", "passthrough", numeric),
    ]
)

model = Pipeline(
    steps=[
        ("preprocess", preprocess),
        ("knn", KNeighborsClassifier(n_neighbors=5)),
    ]
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model.fit(X_train, y_train)

pred = model.predict_proba(X_test)[:, 1]
print("ROC AUC:", roc_auc_score(y_test, pred))

Path("backend/models").mkdir(exist_ok=True)
joblib.dump(model, "backend/models/knn.pkl")

print("Model saved!")
