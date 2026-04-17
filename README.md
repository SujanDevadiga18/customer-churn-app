# ChurnIQ — Telecom Customer Churn Prediction Platform

ChurnIQ is a modern, high-performance, and futuristic web application designed for telecom providers to predict, monitor, and address customer churn. Combining Machine Learning models with Large Language Model (LLM) insights, it provides strategic business analytics directly to your browser.

## 🚀 Key Evolutionary Features

This platform recently underwent a massive architectural and UI/UX modernization:

1. **Futuristic Dark UI ("Glassmorphism")**: Entirely rebuilt using React 19, Material UI (MUI), and Framer Motion. Features a deep dark theme (`#0A0A0F`), neon accents (Cyan, Purple, Pink), rounded glass-effect cards, animated UI transitions, and circular risk indicators. 
2. **Direct Business Access**: Authentication and JWT hurdles have been totally removed for friction-free executive dashboard access.
3. **True Business Language**: Abstract technical jargon ("Neural Analysis", "Carrier Node", "Telemetry") replaced with standard, clear business English ("Single Prediction", "Service Provider", "Batch Upload").
4. **Precision ML Thresholds**: Churn probability threshold optimized from `>= 0.70` down to `>= 0.50`, dramatically improving detection accuracy and yielding realistic analytics (from 0.03% to ~7% fleet churn rate).
5. **AI-Powered Diagnostics**: Integrates with Groq Cloud (`llama-3.1-8b-instant`) to provide detailed, actionable retention plans for both single customer lookups and mass-batch uploads.

---

## 🛠 Tech Stack

### Frontend (User Interface)
- **Framework**: React.js (v19)
- **Styling**: Material UI (MUI v7), Custom CSS gradients, Glassmorphism techniques
- **Animations**: Framer Motion
- **Charting**: Recharts (Responsive Area, Pie, Bar, and Line charts)
- **Routing**: React Router DOM

### Backend (API & Model Handling)
- **Framework**: FastAPI (Python)
- **Data Processing**: Pandas, NumPy
- **Database**: SQLite with SQLAlchemy ORM
- **Machine Learning**: Scikit-Learn (RandomForestClassifier / XGBoost)
- **Generative AI**: Groq Cloud API for contextual LLM explanations

---

## 📊 Core Pages & Capabilities

1. **Dashboard (`/dashboard`)**
   - **Metrics**: Total Predictions, Churn Rate, Revenue at Risk, Safe Customers.
   - **Charts**: Probability distributions, Subscriber Provider share, Avg Churn per Provider, Avg Monthly Charges vs Tenure.
   - **High-Risk Table**: Sorts and lists the top 10 customers most likely to churn based on recent model predictions.
   - **System Controls**: Complete Data Reset and Refresh functionality.

2. **Single Prediction (`/predict`)**
   - Take 6 key data points (Provider, Data Used, Tenure, Inactive Days, Calls, SMS).
   - Generates an immediate probability score via ML.
   - Triggers the AI agent to output a detailed strategic breakdown of *Why* the customer might leave, paired with 3 dynamic, severity-based action cards (e.g., Immediate Outreach vs Engagement Offer).

3. **Batch Upload (`/batch`)**
   - Drop a standard CSV containing thousands of customer metrics.
   - **Speed**: Bulk inserts prediction logs to the SQLite engine instantly.
   - **UI Rendering**: Previews the first 20 records directly in a data table.
   - **AI Batch Summary**: Generates a long-form executive summary detailing macro-level fleet health and multi-phase retention tactics.
   - **Export**: Full CSV download of the annotated dataset including probability scores.

4. **Prediction History & Reports (`/history` -> `/report/:id`)**
   - Tabular history of all predicted customers with Provider dropdown filtering.
   - Clicking a record links to a **Detailed Report Page** summarizing exactly what broke trust.
   - Generates and downloads native `.pdf` reports dynamically via Python `reportlab` logic.

---

## 💻 Setup & Execution

### Prerequisites
- Python 3.11+
- Node.js & npm

### Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 5000
```
*Note: Ensure your `.env` contains a valid `GROQ_API_KEY` for AI summaries.*

### Frontend Setup
```bash
cd frontend
npm install
npm run start
```
Runs on `http://localhost:3000`.

---

## 🧠 Future Roadmap

- **Live Streaming Subscriptions**: Transition the Data Dashboard to WebSocket pushes for 100% real-time Command Center analytics.
- **Auto-Retrain Mechanism**: Implement Apache Airflow / Celery tasks to re-train the RandomForest model bi-weekly on new Batch data.
- **Provider API Webhooks**: Add direct hooks to automatically push high-risk customers into Salesforce or Hubspot.

---
*Built with ❤️ for Telecom Strategic Retention.*
