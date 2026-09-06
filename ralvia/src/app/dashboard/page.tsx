import { getInvoices } from "@/lib/api/invoice";
import RunAgentButton from "@/components/agent/RunAgentButton";
import { getAlerts } from "@/lib/api/alert";
import AlertsPanel from "@/components/alerts/AlertsPanel";
import { getAnalytics } from "@/lib/api/analytics";
import AgingChart from "@/components/analytics/AgingChart";
import InvoiceStatusChart from "@/components/analytics/InvoiceStatusChart";
import InvoiceTrendChart from "@/components/analytics/InvoiceTrendChart";
import ForecastSection from "@/components/forecast/ForecastSection";

export default async function DashboardPage() {
  const [invoices, alerts, analytics] = await Promise.all([
    getInvoices(),
    getAlerts(),
    getAnalytics(),
  ]);

  const overdueInvoices = invoices.filter(
    (invoice) => invoice.status === "overdue"
  );

  const highPriorityInvoices = invoices.filter(
    (invoice) => invoice.priority === "high"
  );

  const totalOverdueAmount = overdueInvoices.reduce(
    (total, invoice) => total + Number(invoice.amount),
    0
  );

  return (
    <div className="bg-[#FBFAF8]">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-[#14213D]">
            Finance overview
          </h1>
          <p className="mt-2 text-[#5B6472]">
            Here is what needs your attention.
          </p>
        </div>

        <RunAgentButton />
      </div>

      {/* Ledger strip: one panel, divided, instead of three identical cards */}
      <div className="mt-8 grid grid-cols-1 divide-y divide-[#D8DCE3] rounded-md border border-[#D8DCE3] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Stat label="High priority" value={highPriorityInvoices.length} />
        <Stat
          label="Overdue amount"
          value={`$${totalOverdueAmount.toLocaleString()}`}
          tone="alert"
        />
        <Stat label="Overdue invoices" value={overdueInvoices.length} />
      </div>

      {/* Charts: the visual read of where things stand */}
      <section className="mt-12 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AgingChart data={analytics.aging} />

        <InvoiceStatusChart
          paid={analytics.summary.paid_amount}
          pending={analytics.summary.pending_amount}
          overdue={analytics.summary.total_overdue}
        />
      </section>

      <section className="mt-6">
        <InvoiceTrendChart data={analytics.monthly} />
      </section>

      <section className="mt-12">
        <SectionHeading
          title="Critical alerts"
          subtitle="Issues detected by your finance agent."
        />
        <div className="mt-5">
          <AlertsPanel alerts={alerts} />
        </div>
      </section>

      <div className="mt-12">
        <SectionHeading
          title="Needs attention"
          subtitle="Prioritized by your finance agent."
        />

        <div className="mt-5 space-y-4">
          {highPriorityInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="rounded-md border border-[#D8DCE3] bg-white p-6"
              style={{ borderLeftColor: "#C08A2E", borderLeftWidth: "3px" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-[#14213D]">
                    {invoice.customer.name}
                  </h3>

                  <p className="mt-1 text-sm text-[#5B6472]">
                    {invoice.invoice_number} &middot; $
                    {Number(invoice.amount).toLocaleString()}
                  </p>
                </div>

                <span className="whitespace-nowrap text-sm font-medium text-[#B3261E]">
                  High priority
                </span>
              </div>

              <p className="mt-4 text-[#14213D]">
                This invoice is{" "}
                <strong>{invoice.days_overdue} days overdue</strong>.
              </p>

              {invoice.recommended_action && (
                <div
                  className="mt-4 bg-[#FBFAF8] p-4"
                  style={{ borderLeftColor: "#D8DCE3", borderLeftWidth: "2px" }}
                >
                  <p className="text-sm font-medium text-[#5B6472]">
                    Recommended action
                  </p>

                  <p className="mt-1 font-medium text-[#14213D]">
                    {invoice.recommended_action.title}
                  </p>

                  <p className="mt-1 text-sm text-[#5B6472]">
                    {invoice.recommended_action.reason}
                  </p>
                </div>
              )}
            </div>
          ))}

          {highPriorityInvoices.length === 0 && (
            <div className="rounded-md border border-[#D8DCE3] bg-white p-6 text-[#5B6472]">
              No high-priority invoices right now.
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <ForecastSection />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "alert";
}) {
  return (
    <div className="p-6">
      <p className="text-sm text-[#5B6472]">{label}</p>
      <p
        className={
          "mt-2 font-serif text-3xl " +
          (tone === "alert" ? "text-[#B3261E]" : "text-[#14213D]")
        }
      >
        {value}
      </p>
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="font-serif text-xl text-[#14213D]">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-[#5B6472]">{subtitle}</p>}
    </div>
  );
}