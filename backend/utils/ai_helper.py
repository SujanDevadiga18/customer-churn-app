import os
from groq import Groq
import os
from pathlib import Path
from dotenv import load_dotenv

# load .env from the same directory as this file (backend/utils/)
# OR better: from the backend root. 
# ai_helper is in backend/utils, .env is in backend/.
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY is not set. Add it to .env or environment variables.")

client = Groq(api_key=GROQ_API_KEY)

MODEL = "llama-3.1-8b-instant"

def explain_single_customer(features: dict, probability: float):
    prompt = f"""
You are an analyst. Explain why a telecom customer may or may not churn.

Customer data:
{features}

Model churn probability: {round(probability, 3)}

Write 4–6 short bullet points:
- mention key risk signals
- mention what reduces churn risk
- keep simple and non-technical
"""

    resp = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )

    return resp.choices[0].message.content.strip()


def summarize_batch(stats: dict):
    prompt = f"""
You are a telecom churn analyst.

Dataset summary:
{stats}

Explain in 6–8 bullet points:
- % likely churn customers
- which segments are risky
- common reasons churn occurs
- suggested retention actions
- short actionable insights for business
"""

    resp = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
    )

    return resp.choices[0].message.content.strip()
