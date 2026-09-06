from schemas.follow_up import FollowUpRequest
from schemas.follow_up import FollowUpResponse

import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def generate_follow_up(data: FollowUpRequest) -> FollowUpResponse:
    prompt = f"""
                  You are a finance operations assistant for SMEs.

                  Write a concise, professional payment follow-up email.

                  Rules:
                  - Do not invent facts.
                  - Mention the invoice number.
                  - Mention the amount.
                  - Mention how many days overdue it is.
                  - Be polite but appropriately firm.
                  - Do not include unnecessary explanations.

                  Customer: {data.customer_name}
                  Invoice number: {data.invoice_number}
                  Amount: ${data.amount:,.2f}
                  Days overdue: {data.days_overdue}
                  """

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=FollowUpResponse,
        ),
    )

    return FollowUpResponse.model_validate_json(response.text)