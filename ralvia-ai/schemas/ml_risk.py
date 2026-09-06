from pydantic import BaseModel

class HistoricalInvoice(BaseModel):
  id: int
  customer_id: int
  amount: float
  issue_date: str
  due_date: str
  paid_at: str

class RiskTrainingRequest(BaseModel):
  invoices: list[HistoricalInvoice]

class RiskPredictionRequest(BaseModel):
    amount: float
    payment_terms_days: int
    issue_month: int
    previous_invoice_count: int
    previous_late_rate: float
    previous_avg_days_late: float
    amount_vs_customer_average: float

class RiskPredictionItem(BaseModel):
    invoice_id: int
    amount: float
    payment_terms_days: int
    issue_month: int
    previous_invoice_count: int
    previous_late_rate: float
    previous_avg_days_late: float
    amount_vs_customer_average: float


class BatchRiskPredictionRequest(BaseModel):
    invoices: list[RiskPredictionItem]


class RiskExplanationRequest(BaseModel):
    invoice_number: str
    customer_name: str
    amount: float
    due_date: str

    late_probability: float
    risk: str

    payment_terms_days: int
    previous_invoice_count: int
    previous_late_rate: float
    previous_avg_days_late: float
    amount_vs_customer_average: float