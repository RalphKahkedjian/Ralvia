from pydantic import BaseModel


class InvoiceData(BaseModel):
    issue_date: str
    amount: float


class ForecastRequest(BaseModel):
    invoices: list[InvoiceData]
    months: int = 3