import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

from schemas.analytics_explanation import (
    AnalyticsExplanationRequest,
    AnalyticsExplanationResponse,
)

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def explain_analytics(
    data: AnalyticsExplanationRequest
) -> AnalyticsExplanationResponse:

    aging_text = "\n".join(
        f"- {bucket.label}: ${bucket.amount:,.2f}"
        for bucket in data.aging
    )

    prompt = f"""
You are Ralvia, an AI finance operations assistant for SMEs.

Explain this overdue aging chart in simple business language.

Language: {data.language}

Chart:
{aging_text}

Rules:
- Keep it short.
- Explain which bucket is the biggest concern.
- Mention important amounts.
- Do not invent facts.
- Speak naturally because this will be read aloud.
- If language is Arabic, answer fully in Arabic.
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=AnalyticsExplanationResponse,
        ),
    )

    return AnalyticsExplanationResponse.model_validate_json(
        response.text
    )