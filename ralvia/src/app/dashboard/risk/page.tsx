import Link from "next/link";

import {
  getRiskIntelligence,
} from "@/lib/api/risk-intelligence";


function riskStyle(risk: string) {
  if (risk === "high") {
    return "bg-red-50 text-red-700";
  }

  if (risk === "medium") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
}


export default async function RiskIntelligencePage() {
  const data =
    await getRiskIntelligence();

  const highRisk =
    data.invoices.filter(
      (invoice) =>
        invoice.risk === "high"
    );

  const mediumRisk =
    data.invoices.filter(
      (invoice) =>
        invoice.risk === "medium"
    );

  const lowRisk =
    data.invoices.filter(
      (invoice) =>
        invoice.risk === "low"
    );

  const amountAtRisk =
    highRisk.reduce(
      (total, invoice) =>
        total + invoice.amount,
      0
    );

  const sortedInvoices = [
    ...data.invoices,
  ].sort(
    (a, b) =>
      b.late_probability -
      a.late_probability
  );

  return (
    <div>
      {/* Header */}

      <div>
        <p className="text-sm font-medium text-[#5B6472]">
          Machine learning
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#14213D]">
          Risk Intelligence
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
          Predict which invoices are most
          likely to be paid late based on
          historical customer payment
          behavior.
        </p>
      </div>

      {/* Summary cards */}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="High risk"
          value={highRisk.length.toString()}
        />

        <SummaryCard
          label="Medium risk"
          value={mediumRisk.length.toString()}
        />

        <SummaryCard
          label="Low risk"
          value={lowRisk.length.toString()}
        />

        <SummaryCard
          label="High-risk amount"
          value={formatCurrency(
            amountAtRisk
          )}
        />
      </div>

      {/* Table */}

      <div className="mt-8 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#14213D]">
            Invoice risk
          </h2>

          <p className="mt-1 text-sm text-[#6B7280]">
            Ranked by predicted probability
            of late payment.
          </p>
        </div>

        {sortedInvoices.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-[#14213D]">
              No unpaid invoices
            </p>

            <p className="mt-1 text-sm text-[#6B7280]">
              Risk predictions will appear
              here when you have invoices
              awaiting payment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8F9FB]">
                <tr className="text-xs uppercase tracking-wide text-[#6B7280]">
                  <th className="px-6 py-4 font-medium">
                    Invoice
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Customer
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Amount
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Due date
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Late risk
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Risk
                  </th>

                  <th className="px-6 py-4" />
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EEF0F3]">
                {sortedInvoices.map(
                  (invoice) => (
                    <tr
                      key={invoice.id}
                      className="transition hover:bg-[#FAFBFC]"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-[#14213D]">
                          {
                            invoice.invoice_number
                          }
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-[#374151]">
                        {
                          invoice.customer
                            .name
                        }
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-[#14213D]">
                        {formatCurrency(
                          invoice.amount
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm text-[#5B6472]">
                        {formatDate(
                          invoice.due_date
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-[#EEF0F3]">
                            <div
                              className="h-full rounded-full bg-[#14213D]"
                              style={{
                                width: `${Math.round(
                                  invoice.late_probability *
                                    100
                                )}%`,
                              }}
                            />
                          </div>

                          <span className="text-sm font-semibold text-[#14213D]">
                            {formatProbability(
                              invoice.late_probability
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${riskStyle(
                            invoice.risk
                          )}`}
                        >
                          {invoice.risk}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/dashboard/risk/${invoice.id}`}
                          className="text-sm font-semibold text-[#14213D] hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs leading-5 text-[#8A93A3]">
        Risk scores are predictive estimates
        based on available historical payment
        behavior and should be used as
        decision-support signals.
      </p>
    </div>
  );
}


function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <p className="text-sm font-medium text-[#6B7280]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-[#14213D]">
        {value}
      </p>
    </div>
  );
}


function formatProbability(
  probability: number
) {
  return `${(
    probability * 100
  ).toFixed(1)}%`;
}


function formatCurrency(
  amount: number
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }
  ).format(amount);
}


function formatDate(
  date: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(new Date(date));
}