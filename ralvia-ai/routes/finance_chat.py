from fastapi import APIRouter

from schemas.chat import (
    FinanceChatRequest,
    FinanceChatResponse,
)

from services.finance_chat_service import ask_finance_agent


router = APIRouter(
    prefix="/chat",
    tags=["Finance Chat"]
)


@router.post("", response_model=FinanceChatResponse)
def chat(data: FinanceChatRequest):
    return ask_finance_agent(data)