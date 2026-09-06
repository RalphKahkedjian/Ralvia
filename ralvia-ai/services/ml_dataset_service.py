import pandas as pd


def build_invoice_risk_dataset(
    invoices: list[dict],
) -> pd.DataFrame:
    if not invoices:
        return pd.DataFrame()

    df = pd.DataFrame(invoices)

    df["issue_date"] = pd.to_datetime(
        df["issue_date"]
    )
    df["due_date"] = pd.to_datetime(
        df["due_date"]
    )
    df["paid_at"] = pd.to_datetime(
        df["paid_at"]
    )
    df["amount"] = pd.to_numeric(
        df["amount"]
    )

    df = df.sort_values(
        by=["issue_date", "id"]
    ).reset_index(drop=True)

    rows = []

    for _, invoice in df.iterrows():
        customer_id = int(
            invoice["customer_id"]
        )

        issue_date = invoice["issue_date"]
        due_date = invoice["due_date"]
        paid_at = invoice["paid_at"]
        amount = float(
            invoice["amount"]
        )

        # Only outcomes Ralvia would have known
        # when this invoice was issued.
        history = df[
            (df["customer_id"] == customer_id)
            & (df["issue_date"] < issue_date)
            & (df["paid_at"] <= issue_date)
        ]

        previous_invoice_count = len(
            history
        )

        late_count = 0
        total_days_late = 0
        total_amount = 0.0

        for _, previous in history.iterrows():
            previous_due = previous["due_date"]
            previous_paid = previous["paid_at"]

            if previous_paid > previous_due:
                late_count += 1

                total_days_late += max(
                    0,
                    (
                        previous_paid
                        - previous_due
                    ).days,
                )

            total_amount += float(
                previous["amount"]
            )

        if previous_invoice_count > 0:
            previous_late_rate = (
                late_count
                / previous_invoice_count
            )

            previous_avg_days_late = (
                total_days_late
                / previous_invoice_count
            )

            previous_avg_amount = (
                total_amount
                / previous_invoice_count
            )

            amount_vs_customer_average = (
                amount / previous_avg_amount
                if previous_avg_amount > 0
                else 1.0
            )
        else:
            previous_late_rate = 0.0
            previous_avg_days_late = 0.0
            amount_vs_customer_average = 1.0

        payment_terms_days = (
            due_date - issue_date
        ).days

        late = int(
            paid_at > due_date
        )

        rows.append(
            {
                "invoice_id":
                    int(invoice["id"]),
                "customer_id":
                    customer_id,
                "amount":
                    amount,
                "payment_terms_days":
                    payment_terms_days,
                "issue_month":
                    issue_date.month,
                "previous_invoice_count":
                    previous_invoice_count,
                "previous_late_rate":
                    previous_late_rate,
                "previous_avg_days_late":
                    previous_avg_days_late,
                "amount_vs_customer_average":
                    amount_vs_customer_average,
                "late":
                    late,
            }
        )

    return pd.DataFrame(rows)