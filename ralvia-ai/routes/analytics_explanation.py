from fastapi import APIRouter

from schemas.analytics_explanation import (
    AnalyticsExplanationRequest,
    AnalyticsExplanationResponse,
)

from services.analytics_explanation_service import explain_analytics


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.post(
    "/explain",
    response_model=AnalyticsExplanationResponse
)
def explain_chart(
    data: AnalyticsExplanationRequest
):
    return explain_analytics(data)