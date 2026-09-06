import pandas as pd
from prophet import Prophet


def prepare_monthly_invoice_data(
    invoices: list[dict]
):
    df = pd.DataFrame(invoices)

    df["issue_date"] = pd.to_datetime(
        df["issue_date"]
    )

    df["amount"] = pd.to_numeric(
        df["amount"]
    )

    monthly = (
        df.groupby(
            df["issue_date"].dt.to_period("M")
        )["amount"]
        .sum()
        .reset_index()
    )

    monthly["issue_date"] = (
        monthly["issue_date"]
        .dt.to_timestamp()
    )

    monthly = monthly.rename(
        columns={
            "issue_date": "ds",
            "amount": "y",
        }
    )

    return monthly


def forecast_invoice_volume(
    monthly_data,
    months: int = 3,
):
    model = Prophet()

    model.fit(monthly_data)

    future = model.make_future_dataframe(
        periods=months,
        freq="MS",
    )

    forecast = model.predict(future)

    result = forecast[
        [
            "ds",
            "yhat",
            "yhat_lower",
            "yhat_upper",
        ]
    ]

    return result