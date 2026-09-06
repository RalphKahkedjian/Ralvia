from pydantic import BaseModel

class FollowUpRequest(BaseModel):
  customer_name: str
  invoice_number: str
  amount: float
  days_overdue: int

class FollowUpResponse(BaseModel):
  subject: str
  message: str

  