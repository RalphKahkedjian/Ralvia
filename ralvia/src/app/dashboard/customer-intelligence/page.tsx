import Link from "next/link";

import { getCustomerIntelligence } from
  "@/lib/api/customer-intelligence";

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

function getReliability(
  paidCount: number,
  lateRate: number
) {
  if (paidCount === 0) {
    return {
      label: "No history",
      className: "text-[#6B7280] bg-[#F3F4F6]",
    };
  }

  if (lateRate >= 0.7) {
    return {
      label: "Needs attention",
      className: "text-[#B3261E] bg-[#FDECEC]",
    };
  }

  if (lateRate >= 0.4) {
    return {
      label: "Watch",
      className: "text-[#9A6700] bg-[#FFF7E0]",
    };
  }

  return {
    label: "Reliable",
    className: "text-[#2F6F4E] bg-[#EAF5EF]",
  };
}

export default async function CustomerIntelligencePage() {
  const data =
    await getCustomerIntelligence();

  const customers = [...data.customers].sort(
    (a, b) =>
      b.metrics.late_payment_rate -
      a.metrics.late_payment_rate
  );

  return (
    <div>
      <div>
        <p className="text-sm font-medium text-[#5B6472]">
          Intelligence
        </p>

        <h1 className="mt-1 text-2xl font-semibold text-[#14213D]">
          Customer Intelligence
        </h1>

        <p className="mt-2 text-sm text-[#6B7280]">
          Understand how your customers actually pay
          and identify accounts that may need closer
          attention.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-6 py-5">
          <h2 className="font-semibold text-[#14213D]">
            Payment behavior
          </h2>

          <p className="mt-1 text-sm text-[#6B7280]">
            {data.count} customers analyzed
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FB]">
              <tr className="text-xs font-semibold uppercase tracking-wide text-[#8A93A3]">
                <th className="px-6 py-4">
                  Customer
                </th>

                <th className="px-6 py-4">
                  Total invoiced
                </th>

                <th className="px-6 py-4">
                  Invoices
                </th>

                <th className="px-6 py-4">
                  Late rate
                </th>

                <th className="px-6 py-4">
                  Avg. delay
                </th>

                <th className="px-6 py-4">
                  Behavior
                </th>

                <th className="px-6 py-4" />
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E7EB]">
              {customers.map((item) => {
                const hasHistory =
                  item.metrics.paid_invoice_count > 0;

                const reliability =
                  getReliability(
                    item.metrics.paid_invoice_count,
                    item.metrics.late_payment_rate
                  );

                return (
                  <tr
                    key={item.customer.id}
                    className="transition hover:bg-[#FAFAFB]"
                  >
                    <td className="px-6 py-5">
                      <p className="font-medium text-[#14213D]">
                        {item.customer.name}
                      </p>

                      <p className="mt-1 text-xs text-[#8A93A3]">
                        {item.customer.email}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm text-[#374151]">
                      {formatCurrency(
                        item.metrics.total_invoiced
                      )}
                    </td>

                    <td className="px-6 py-5 text-sm text-[#374151]">
                      {item.metrics.invoice_count}
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-[#374151]">
                      {hasHistory
                        ? `${(
                            item.metrics
                              .late_payment_rate * 100
                          ).toFixed(1)}%`
                        : "—"}
                    </td>

                    <td className="px-6 py-5 text-sm text-[#374151]">
                      {hasHistory
                        ? `${item.metrics.average_days_late.toFixed(
                            1
                          )} days`
                        : "—"}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${reliability.className}`}
                      >
                        {reliability.label}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/dashboard/customer-intelligence/${item.customer.id}`}
                        className="text-sm font-semibold text-[#14213D] hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}