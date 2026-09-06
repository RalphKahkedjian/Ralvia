from pydantic import BaseModel


class AgingBucket(BaseModel):
    label: str
    amount: float


class AnalyticsExplanationRequest(BaseModel):
    chart_type: str
    language: str
    aging: list[AgingBucket]


class AnalyticsExplanationResponse(BaseModel):
    explanation: str