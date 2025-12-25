import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
import joblib
from pathlib import Path

DATA_PATH = Path("../data/churn.csv")
MODEL_DIR = Path("../backend/models")
MODEL_DIR.mkdir(exist_ok=True)

df = pd.read_csv(DATA_PATH)

# ----------------------
# 1️⃣ Prepare features
# ----------------------
df = df.dropna()

X = df.drop("Churn", axis=1)
y = df["Churn"].map({"Yes": 1, "No": 0})

numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns
categorical_cols = X.select_dtypes(include=['object']).columns

preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
    ]
)

# ----------------------
# 2️⃣ Define models
# ----------------------
models = {
    "knn": KNeighborsClassifier(n_neighbors=5),
    "logistic": LogisticRegression(max_iter=200),
    "random_forest": RandomForestClassifier(n_estimators=120)
}

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

best_model = None
best_auc = 0
best_name = ""

for name, model in models.items():
    pipe = Pipeline([
        ("preprocess", preprocessor),
        ("model", model)
    ])

    pipe.fit(X_train, y_train)

    preds = pipe.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, preds)

    print(f"{name} AUC: {auc:.3f}")

    if auc > best_auc:
        best_auc = auc
        best_model = pipe
        best_name = name

print(f"\nBest model: {best_name}  (AUC={best_auc:.3f})")

# ----------------------
# 3️⃣ Save model + preprocessor
# ----------------------
joblib.dump(best_model, MODEL_DIR / "knn.pkl")
print("Model saved!")
