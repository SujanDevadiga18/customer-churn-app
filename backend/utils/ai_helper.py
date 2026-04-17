import os
from groq import Groq
from pathlib import Path
from dotenv import load_dotenv

# load .env from the backend root
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = None

if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)
else:
    print("⚠️ GROQ_API_KEY is not set. AI explanations will be disabled.")

MODEL = "llama-3.1-8b-instant"

def explain_single_customer(features: dict, probability: float):
    def get_fallback():
        reasons = []
        if features.get('inactive_days', 0) > 20: 
            reasons.append("High inactivity: Current inactivity exceeds 20 days.")
        if features.get('tenure_months', 0) < 6: 
            reasons.append("Early fragile period: Customer is in the first 6 months of service.")
        if features.get('data_used', 0) < 500: 
            reasons.append("Low engagement: Monthly data consumption is below 500MB.")
        if features.get('calls_made', 0) < 10:
            reasons.append("Low call volume: Infrequent usage of voice services.")
        
        status = "CRITICAL" if probability > 0.7 else "MODERATE" if probability > 0.4 else "STABLE"
        msg = f"**Status: {status}**\n\nKey Observations:\n" + ("\n".join([f"- {r}" for r in reasons]) if reasons else "- Usage patterns are currently within stable parameters.")
        
        advice = "\n\n**Actionable Suggestions:**\n"
        if probability > 0.4:
            advice += "- Reach out with a personalized data incentive plan.\n- Verify if the customer experienced any recent service issues.\n- Offer a loyalty discount for a 6-month commitment."
        else:
            advice += "- Maintain current service standard.\n- Monitor usage for any sudden drops in activity."
            
        return f"{msg}{advice}"

    if client:
        try:
            label = "CRITICAL" if probability > 0.7 else "MODERATE" if probability > 0.4 else "STABLE"
            prompt = f"""
            You are a Senior Strategic Retention Analyst. Analyze this customer profile and provide a COMPREHENSIVE STRATEGIC REPORT.
            
            CUSTOMER DATA:
            - Service Provider: {features.get('telecom_partner')}
            - Monthly Data Usage: {features.get('data_used')} MB
            - Account Tenure: {features.get('tenure_months')} months
            - Inactivity: {features.get('inactive_days')} days
            - SMS Activity: {features.get('sms_sent')} sent
            - Voice Calls: {features.get('calls_made')} made
            - Probability: {probability*100:.1f}%

            YOUR REPORT MUST INCLUDE:
            1. DEEP BEHAVIORAL ANALYSIS: Why this customer is {label}.
            2. STRATEGIC RETENTION ROADMAP: 3-5 specific, actionable points.
            3. LONG-TERM VALUE PRESERVATION: Recommendations for future loyalty.
            """
            resp = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
                max_tokens=800
            )
            return resp.choices[0].message.content.strip()
        except Exception:
            pass
            
    return get_fallback()

def summarize_batch(stats: dict):
    if client:
        try:
            prompt = f"""
            You are a Senior Principal Data Scientist and Market Strategist presenting to the Executive Board. 
            Analyse the following HIGH-VOLUME batch prediction dataset and provide an EXTREMELY DETAILED STRATEGIC REPORT.

            BATCH METRICS FOR ANALYSIS:
            - Total Account Samples in Fleet: {stats.get('total_rows')}
            - High-Conviction Churn Risk (> 0.7): {stats.get('likely_churn')}
            - Moderate/Migration Risk (0.4 - 0.7): {stats.get('migration_potential')}
            - Current Batch Churn Velocity: {stats.get('churn_rate')}%

            THE REPORT MUST BE LONG-FORM AND COVER THESE SECTIONS:
            
            1. MACRO-LEVEL FLEET HEALTH & RISK MATRIX:
            Discuss the systemic risks of having {stats.get('likely_churn')} high-risk customers. 
            Compare to industry standard churn benchmarks (2-5% for healthy fleets).

            2. DRIVER CORRELATION & PSYCHOLOGICAL PROFILING:
            Hypothesize root causes. Is it service quality? Migration trends? 
            Analyze the 'Middle-Tier' ({stats.get('migration_potential')} users).

            3. PROJECTED REVENUE EXPOSURE & FINANCIAL IMPACT:
            Assuming ARPU of $60, calculate potential monthly revenue loss and secondary financial impacts.

            4. MULTI-PHASE RETENTION TACTICS (IMMEDIATE TO 90 DAYS):
            - PHASE 1 (Days 1-7): Digital interventions.
            - PHASE 2 (Days 8-30): High-touch human outreach.
            - PHASE 3 (Days 31-90): Loyalty program restructuring.

            5. CROSS-DEPARTMENTAL ACTIONS: Specific instructions for Technical, Sales, and Support teams.

            Keep the tone authoritative and extremely detailed.
            """
            resp = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.6,
                max_tokens=2000
            )
            return resp.choices[0].message.content.strip()
        except Exception:
            pass
            
    return f"""
**Detailed Batch Executive Summary**
- **Critical Risk Alert**: Out of {stats.get('total_rows', 0)} accounts, {stats.get('likely_churn', 0)} are at immediate risk of churn.
- **Migration Sentiment**: {stats.get('migration_potential', 0)} users possess a high 'Migration Potential'.

**Strategic Actionable Suggestions**
- **Tier 1 Intervention**: Immediate personalized outreach for at-risk segments.
- **Quality Analysis**: Review service uptime for the high-risk segments.
- **Subscription Migration**: Aim to move 'Maybe' customers onto long-term value plans.
"""
