from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class FinanceChatRequest(BaseModel):
    question: str
    language: str
    context: dict
    history: list[ChatMessage]


# -------------------------
# Customer action
# -------------------------

class CustomerActionData(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None


# -------------------------
# Invoice action
# -------------------------

class InvoiceActionData(BaseModel):
    customer_name: str
    invoice_number: str
    amount: float
    issue_date: str
    due_date: str


# -------------------------
# Email action
# -------------------------

class EmailActionData(BaseModel):
    customer_name: str
    customer_email: str
    subject: str
    message: str


# -------------------------
# Finance action
# -------------------------

class FinanceAction(BaseModel):
    type: str
    requires_approval: bool
    data: (
        CustomerActionData
        | InvoiceActionData
        | EmailActionData
    )


# -------------------------
# Chat response
# -------------------------

class FinanceChatResponse(BaseModel):
    answer: str
    action: FinanceAction | None = None