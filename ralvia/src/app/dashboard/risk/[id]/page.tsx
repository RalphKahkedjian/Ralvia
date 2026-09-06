import Link from "next/link";

import {
  getRiskIntelligence,
} from "@/lib/api/risk-intelligence";

import GenerateRiskAssessmentButton
  from "@/components/risk/GenerateRiskAssessmentButton";


type Props = {
  params: Promise<{
    id: string;
  }>;
};


function riskStyle(risk: string) {
  if (risk === "high") {
    return "bg-red-50 text-red-700";
  }

  if (risk === "medium") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
}


export default async function RiskDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const data =
    await getRiskIntelligence();

  const invoice =
    data.invoices.find(
      (item) =>
        item.id === Number(id)
    );

  if (!invoice) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#14213D]">
          Invoice not found
        </h1>

        <Link
          href="/dashboard/risk"
          className="mt-4 inline-block text-sm font-semibold text-[#14213D] hover:underline"
        >
          ← Back to Risk Intelligence
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/risk"
        className="text-sm font-semibold text-[#5B6472] hover:text-[#14213D]"
      >
        ← Back to Risk Intelligence
      </Link>

      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#5B6472]">
            Risk Intelligence
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#14213D]">
            {invoice.invoice_number}
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            {invoice.customer.name}
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold uppercase ${riskStyle(
            invoice.risk
          )}`}
        >
          {invoice.risk} risk
        </span>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          label="Amount"
          value={formatCurrency(
            invoice.amount
          )}
        />

        <InfoCard
          label="Late probability"
          value={formatProbability(
            invoice.late_probability
          )}
        />

        <InfoCard
          label="Issue date"
          value={formatDate(
            invoice.issue_date
          )}
        />

        <InfoCard
          label="Due date"
          value={formatDate(
            invoice.due_date
          )}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <p className="text-sm font-medium text-[#5B6472]">
          Predicted late payment risk
        </p>

        <div className="mt-4 flex items-end gap-3">
          <p className="text-5xl font-bold tracking-tight text-[#14213D]">
            {formatProbability(
              invoice.late_probability
            )}
          </p>

          <p className="pb-1 text-sm text-[#6B7280]">
            probability of late payment
          </p>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#EEF0F3]">
          <div
            className="h-full rounded-full bg-[#14213D]"
            style={{
              width: `${
                invoice.late_probability *
                100
              }%`,
            }}
          />
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#6B7280]">
          Ralvia predicts payment risk using
          historical customer behavior,
          invoice amount, payment terms, and
          previous payment patterns.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-[#14213D]">
            Risk signals
          </h2>

          <p className="mt-1 text-sm text-[#6B7280]">
            Factors used by the prediction model
            for this invoice.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <RiskSignal
            label="Previous invoices"
            value={
              invoice.features
                .previous_invoice_count
                .toString()
            }
            description="Previous invoices with payment outcomes known when this invoice was issued."
          />

          <RiskSignal
            label="Previous late rate"
            value={`${(
              invoice.features
                .previous_late_rate *
              100
            ).toFixed(0)}%`}
            description="Share of the customer's known previous invoices that were paid late."
          />

          <RiskSignal
            label="Average previous delay"
            value={`${invoice.features.previous_avg_days_late.toFixed(
              1
            )} days`}
            description="Average number of late days across previous invoices."
          />

          <RiskSignal
            label="Payment terms"
            value={`${invoice.features.payment_terms_days} days`}
            description="Number of days between the invoice issue date and due date."
          />

          <RiskSignal
            label="Amount vs usual"
            value={`${invoice.features.amount_vs_customer_average.toFixed(
              2
            )}×`}
            description="Invoice amount compared with the customer's previous average invoice amount."
          />

          <RiskSignal
            label="Issue month"
            value={getMonthName(
              invoice.features.issue_month
            )}
            description="Month in which this invoice was issued."
          />
        </div>

        {invoice.features
          .previous_invoice_count === 0 && (
          <div className="mt-6 rounded-xl bg-[#F8F9FB] px-4 py-4">
            <p className="text-sm leading-6 text-[#5B6472]">
              There is no previous payment
              history available for{" "}
              <span className="font-semibold text-[#14213D]">
                {
                  invoice.customer
                    .name
                }
              </span>
              . This prediction therefore
              relies more heavily on
              invoice-level patterns learned
              from the historical training
              data.
            </p>
          </div>
        )}
        <GenerateRiskAssessmentButton
          invoiceId={invoice.id}
        />
      </div>
    </div>
  );
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
      <p className="text-sm font-medium text-[#6B7280]">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-[#14213D]">
        {value}
      </p>
    </div>
  );
}


function RiskSignal({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#EEF0F3] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[#8A93A3]">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-[#14213D]">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[#6B7280]">
        {description}
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


function getMonthName(
  month: number
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
    }
  ).format(
    new Date(
      2026,
      month - 1,
      1
    )
  );
}