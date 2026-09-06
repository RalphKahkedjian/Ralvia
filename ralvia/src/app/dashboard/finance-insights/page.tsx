import Link from "next/link";

import { getFinanceInsights } from
  "@/lib/api/finance-insights";

import FinanceForecastChart from
  "@/components/finance-insights/FinanceForecastChart";

function formatCurrency(value: number) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatMonth(date: string) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      year: "numeric",
    }
  ).format(new Date(date));
}

export default async function FinanceInsightsPage() {
  const data =
    await getFinanceInsights();

  const nextForecast =
    data.forecast?.forecast?.[0] ?? null;

  return (
    <div>
      {/* Header */}

      <div>
        <p className="text-sm font-medium text-[#5B6472]">
          Intelligence
        </p>

        <h1 className="mt-1 text-3xl font-semibold text-[#14213D]">
          Finance Insights
        </h1>

        <p className="mt-2 text-sm text-[#6B7280]">
          A consolidated view of receivables,
          payment risk, customer behavior, and
          forecasted invoice volume.
        </p>
      </div>

      {/* Overview cards */}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Outstanding Receivables */}

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm text-[#6B7280]">
            Outstanding receivables
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#14213D]">
            {formatCurrency(
              data.overview
                .outstanding_receivables
            )}
          </p>

          <p className="mt-2 text-xs text-[#8A93A3]">
            {
              data.overview
                .unpaid_invoice_count
            }{" "}
            unpaid invoice
            {data.overview
              .unpaid_invoice_count !== 1
              ? "s"
              : ""}
          </p>
        </div>

        {/* High Risk */}

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm text-[#6B7280]">
            High-risk receivables
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#B3261E]">
            {formatCurrency(
              data.overview
                .high_risk_receivables
            )}
          </p>

          <p className="mt-2 text-xs text-[#8A93A3]">
            {
              data.overview
                .high_risk_invoice_count
            }{" "}
            high-risk invoice
            {data.overview
              .high_risk_invoice_count !== 1
              ? "s"
              : ""}
          </p>
        </div>

        {/* Customers needing attention */}

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm text-[#6B7280]">
            Customers needing attention
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#C08A2E]">
            {
              data.overview
                .customers_needing_attention
            }
          </p>

          <p className="mt-2 text-xs text-[#8A93A3]">
            Based on historical payment behavior
          </p>
        </div>

        {/* Next month forecast */}

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm text-[#6B7280]">
            Next month forecast
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#14213D]">
            {nextForecast
              ? formatCurrency(
                  nextForecast.yhat
                )
              : "—"}
          </p>

          <p className="mt-2 text-xs text-[#8A93A3]">
            {nextForecast
              ? formatMonth(
                  nextForecast.ds
                )
              : "No forecast available"}
          </p>
        </div>
      </div>

      {/* High-risk receivables */}

      <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#14213D]">
            High-Risk Receivables
          </h2>

          <p className="mt-1 text-sm text-[#6B7280]">
            Unpaid invoices predicted by the
            machine learning model to have a high
            probability of late payment.
          </p>
        </div>

        {data.high_risk_receivables.length ===
        0 ? (
          <div className="px-6 py-8">
            <p className="text-sm text-[#6B7280]">
              No high-risk receivables detected.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {data.high_risk_receivables.map(
              (invoice) => (
                <div
                  key={invoice.invoice_id}
                  className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-[#FDECEC] px-3 py-1 text-xs font-semibold text-[#B3261E]">
                        High risk
                      </span>

                      <p className="font-semibold text-[#14213D]">
                        {
                          invoice.invoice_number
                        }
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-[#6B7280]">
                      {invoice.customer_name}
                    </p>

                    <p className="mt-1 text-sm text-[#374151]">
                      {formatCurrency(
                        invoice.amount
                      )}{" "}
                      ·{" "}
                      {formatPercent(
                        invoice.late_probability
                      )}{" "}
                      late-payment probability
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/risk/${invoice.invoice_id}`}
                    className="text-sm font-semibold text-[#14213D] hover:underline"
                  >
                    View risk →
                  </Link>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Customer warnings */}

      <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#14213D]">
            Customer Payment Warnings
          </h2>

          <p className="mt-1 text-sm text-[#6B7280]">
            Customers with consistently poor
            historical payment behavior.
          </p>
        </div>

        {data.customer_warnings.length ===
        0 ? (
          <div className="px-6 py-8">
            <p className="text-sm text-[#6B7280]">
              No customer payment warnings.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {data.customer_warnings.map(
              (customer) => (
                <div
                  key={customer.customer_id}
                  className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-[#14213D]">
                      {
                        customer.customer_name
                      }
                    </p>

                    <p className="mt-2 text-sm text-[#374151]">
                      {formatPercent(
                        customer.late_payment_rate
                      )}{" "}
                      late-payment rate
                    </p>

                    <p className="mt-1 text-sm text-[#6B7280]">
                      {
                        customer.late_invoice_count
                      }{" "}
                      of{" "}
                      {
                        customer.paid_invoice_count
                      }{" "}
                      paid invoices were late ·
                      Average delay{" "}
                      {customer.average_days_late.toFixed(
                        1
                      )}{" "}
                      days
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/customer-intelligence/${customer.customer_id}`}
                    className="text-sm font-semibold text-[#14213D] hover:underline"
                  >
                    View customer →
                  </Link>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Invoice Volume Forecast */}

      <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#14213D]">
            Invoice Volume Forecast
          </h2>

          <p className="mt-1 text-sm text-[#6B7280]">
            Prophet forecast for the next three
            months based on historical invoice
            volume.
          </p>
        </div>

        {!data.forecast ? (
          <div className="px-6 py-8">
            <p className="text-sm text-[#6B7280]">
              No forecast available.
            </p>
          </div>
        ) : (
          <div>
            {/*
              THIS IS WHERE YOUR NEW
              FinanceForecastChart COMPONENT GOES
            */}

            <div className="p-6">
              <FinanceForecastChart
                history={
                  data.forecast.history
                }
                forecast={
                  data.forecast.forecast
                }
              />
            </div>

            {/* Exact forecast values */}

            <div className="grid gap-4 px-6 pb-6 md:grid-cols-3">
              {data.forecast.forecast.map(
                (point) => (
                  <div
                    key={point.ds}
                    className="rounded-xl bg-[#F8F9FB] p-5"
                  >
                    <p className="text-sm font-medium text-[#6B7280]">
                      {formatMonth(
                        point.ds
                      )}
                    </p>

                    <p className="mt-2 text-xl font-semibold text-[#14213D]">
                      {formatCurrency(
                        point.yhat
                      )}
                    </p>

                    <p className="mt-2 text-xs text-[#8A93A3]">
                      Expected range{" "}
                      {formatCurrency(
                        point.yhat_lower
                      )}{" "}
                      –{" "}
                      {formatCurrency(
                        point.yhat_upper
                      )}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}