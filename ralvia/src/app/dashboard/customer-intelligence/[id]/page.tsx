import Link from "next/link";
import { notFound } from "next/navigation";

import { getCustomerIntelligence } from
  "@/lib/api/customer-intelligence";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <p className="text-sm text-[#6B7280]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-[#14213D]">
        {value}
      </p>
    </div>
  );
}

export default async function CustomerIntelligenceDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const data =
    await getCustomerIntelligence();

  const item = data.customers.find(
    (customer) =>
      customer.customer.id === Number(id)
  );

  if (!item) {
    notFound();
  }

  const {
    customer,
    metrics,
    invoice_history,
  } = item;

  const hasHistory =
    metrics.paid_invoice_count > 0;

  const onTimeCount =
    metrics.paid_invoice_count -
    metrics.late_invoice_count;

  const onTimeRate = hasHistory
    ? onTimeCount /
      metrics.paid_invoice_count
    : 0;

  return (
    <div>
      {/* Back */}

      <Link
        href="/dashboard/customer-intelligence"
        className="text-sm font-medium text-[#5B6472] hover:text-[#14213D]"
      >
        ← Back to Customer Intelligence
      </Link>

      {/* Header */}

      <div className="mt-6">
        <p className="text-sm font-medium text-[#5B6472]">
          Customer Intelligence
        </p>

        <h1 className="mt-1 text-3xl font-semibold text-[#14213D]">
          {customer.name}
        </h1>

        <p className="mt-2 text-sm text-[#6B7280]">
          {customer.email}
        </p>
      </div>

      {/* Metrics */}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          label="Total invoiced"
          value={formatCurrency(
            metrics.total_invoiced
          )}
        />

        <InfoCard
          label="Invoices"
          value={String(
            metrics.invoice_count
          )}
        />

        <InfoCard
          label="Late payment rate"
          value={
            hasHistory
              ? `${(
                  metrics.late_payment_rate *
                  100
                ).toFixed(1)}%`
              : "No history"
          }
        />

        <InfoCard
          label="Average payment delay"
          value={
            hasHistory
              ? `${metrics.average_days_late.toFixed(
                  1
                )} days`
              : "No history"
          }
        />
      </div>

      {/* Payment behavior */}

      <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#14213D]">
          Payment Behavior
        </h2>

        <p className="mt-1 text-sm text-[#6B7280]">
          Historical payment outcomes for this
          customer.
        </p>

        {!hasHistory ? (
          <div className="mt-6 rounded-xl bg-[#F8F9FB] p-5">
            <p className="text-sm text-[#6B7280]">
              This customer has no completed payment
              history yet.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            {/* On-time */}

            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#374151]">
                  On time
                </span>

                <span className="text-[#6B7280]">
                  {onTimeCount} of{" "}
                  {metrics.paid_invoice_count}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EEF0F3]">
                <div
                  className="h-full rounded-full bg-[#2F6F4E]"
                  style={{
                    width: `${
                      onTimeRate * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Late */}

            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#374151]">
                  Late
                </span>

                <span className="text-[#6B7280]">
                  {metrics.late_invoice_count} of{" "}
                  {metrics.paid_invoice_count}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EEF0F3]">
                <div
                  className="h-full rounded-full bg-[#B3261E]"
                  style={{
                    width: `${
                      metrics.late_payment_rate *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice history */}

      <div className="mt-8 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#14213D]">
            Invoice History
          </h2>

          <p className="mt-1 text-sm text-[#6B7280]">
            Recent invoices and their payment
            outcomes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FB]">
              <tr className="text-xs font-semibold uppercase tracking-wide text-[#8A93A3]">
                <th className="px-6 py-4">
                  Invoice
                </th>

                <th className="px-6 py-4">
                  Amount
                </th>

                <th className="px-6 py-4">
                  Due
                </th>

                <th className="px-6 py-4">
                  Paid
                </th>

                <th className="px-6 py-4">
                  Outcome
                </th>

                <th className="px-6 py-4">
                  Delay
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E7EB]">
              {invoice_history.map(
                (invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-[#FAFAFB]"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#14213D]">
                      {invoice.invoice_number}
                    </td>

                    <td className="px-6 py-4 text-sm text-[#374151]">
                      {formatCurrency(
                        invoice.amount
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-[#374151]">
                      {formatDate(
                        invoice.due_date
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-[#374151]">
                      {formatDate(
                        invoice.paid_at
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {invoice.payment_outcome ===
                      "late" ? (
                        <span className="rounded-full bg-[#FDECEC] px-3 py-1 text-xs font-semibold text-[#B3261E]">
                          Late
                        </span>
                      ) : invoice.payment_outcome ===
                        "on_time" ? (
                        <span className="rounded-full bg-[#EAF5EF] px-3 py-1 text-xs font-semibold text-[#2F6F4E]">
                          On time
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#6B7280]">
                          Unpaid
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-[#374151]">
                      {invoice.payment_outcome ===
                      "late"
                        ? `${invoice.days_late} days`
                        : invoice.payment_outcome ===
                          "on_time"
                        ? "0 days"
                        : "—"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}