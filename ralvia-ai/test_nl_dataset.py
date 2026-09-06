from services.ml_dataset_service import (
    build_invoice_risk_dataset,
)


invoices = [
    {
        "id": 1,
        "customer_id": 10,
        "amount": 1000,
        "issue_date": "2026-01-01",
        "due_date": "2026-01-31",
        "paid_at": "2026-01-28",
    },
    {
        "id": 2,
        "customer_id": 10,
        "amount": 1200,
        "issue_date": "2026-02-01",
        "due_date": "2026-03-03",
        "paid_at": "2026-03-10",
    },
    {
        "id": 3,
        "customer_id": 10,
        "amount": 3000,
        "issue_date": "2026-03-01",
        "due_date": "2026-03-31",
        "paid_at": "2026-04-12",
    },
]


dataset = build_invoice_risk_dataset(
    invoices
)

print(dataset.to_string(index=False))