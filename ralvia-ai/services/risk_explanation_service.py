import json
import os

from google import genai


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

MODEL_NAME = "gemini-3.5-flash-lite"


def build_risk_explanation_prompt(
    data: dict,
):
    probability_percent = round(
        data["late_probability"] * 100,
        1,
    )

    late_rate_percent = round(
        data["previous_late_rate"] * 100,
        1,
    )

    return f"""
You are Ralvia, an AI finance operations assistant for SMEs.

Explain an invoice payment-risk prediction in simple business language.

IMPORTANT RULES:
- The machine learning model already calculated the risk.
- Do NOT calculate a new probability.
- Do NOT change the risk level.
- Do NOT claim causation.
- Do NOT invent customer behavior.
- Only use the facts provided below.
- If there is no previous customer history, explicitly say that.
- Keep the explanation concise and practical.

Invoice:
Invoice number: {data["invoice_number"]}
Customer: {data["customer_name"]}
Amount: ${data["amount"]:.2f}
Due date: {data["due_date"]}

ML prediction:
Late-payment probability: {probability_percent}%
Risk level: {data["risk"]}

Risk signals:
Payment terms: {data["payment_terms_days"]} days
Previous invoices: {data["previous_invoice_count"]}
Previous late-payment rate: {late_rate_percent}%
Average previous delay: {data["previous_avg_days_late"]:.1f} days
Amount compared with customer average: {data["amount_vs_customer_average"]:.2f}x

Return JSON only with this exact structure:

{{
  "summary": "short explanation",
  "recommendation": "short recommended action"
}}
"""


def clean_json_response(
    text: str,
) -> str:
    text = text.strip()

    if text.startswith("```json"):
        text = text[7:]

    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    return text.strip()


def explain_invoice_risk(
    data: dict,
):
    prompt = build_risk_explanation_prompt(
        data
    )

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )

    if not response.text:
        raise ValueError(
            "Gemini returned an empty response."
        )

    cleaned_response = clean_json_response(
        response.text
    )

    try:
        result = json.loads(
            cleaned_response
        )

    except json.JSONDecodeError as error:
        raise ValueError(
            f"Gemini returned invalid JSON: "
            f"{cleaned_response}"
        ) from error

    if (
        "summary" not in result
        or "recommendation" not in result
    ):
        raise ValueError(
            "Gemini response is missing "
            "summary or recommendation."
        )

    return {
        "summary": result["summary"],
        "recommendation":
            result["recommendation"],
    }