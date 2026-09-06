from fastapi import APIRouter
from schemas.follow_up import FollowUpRequest, FollowUpResponse
from services.follow_up_service import generate_follow_up

router = APIRouter(
    prefix="/follow-ups",
    tags=["Follow Ups"]
)

@router.post("/generate", response_model=FollowUpResponse)
def generate(data: FollowUpRequest):
    return generate_follow_up(data)