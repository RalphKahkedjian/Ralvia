from fastapi import APIRouter

from schemas.forecast import ForecastRequest
from services.forecast_service import (
    prepare_monthly_invoice_data,
    forecast_invoice_volume,
)

router = APIRouter(
    prefix="/forecast",
    tags=["Forecast"],
)


@router.post("")
def forecast(data: ForecastRequest):
    invoices = [
        invoice.model_dump()
        for invoice in data.invoices
    ]

    monthly_data = prepare_monthly_invoice_data(invoices)

    forecast_data = forecast_invoice_volume(
        monthly_data,
        data.months,
    )

    future_only = forecast_data.tail(data.months)

    return {
        "history": monthly_data.to_dict(
            orient="records"
        ),
        "forecast": future_only.to_dict(
            orient="records"
        ),
    }