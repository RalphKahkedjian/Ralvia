import Link from "next/link";
import { Alert } from "@/types/alert";

type Props = {
  alerts: Alert[];
};

export default function AlertsPanel({ alerts }: Props) {
  const unreadAlerts = alerts.filter(
    (alert) => alert.status === "unread"
  );

  if (unreadAlerts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="font-semibold text-gray-900">
          No critical alerts
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Ralvia hasn&apos;t detected anything requiring immediate attention.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadAlerts.map((alert) => (
        <div
          key={alert.id}
          className="rounded-xl border border-red-200 bg-red-50 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span>⚠️</span>

                <p className="font-semibold text-red-900">
                  {alert.title}
                </p>
              </div>

              {alert.invoice && (
                <p className="mt-2 text-sm font-medium text-gray-800">
                  {alert.invoice.invoice_number}
                  {" · "}
                  {alert.invoice.customer.name}
                </p>
              )}

              <p className="mt-2 text-sm text-gray-700">
                {alert.message}
              </p>
            </div>

            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase text-red-700">
              {alert.severity}
            </span>
          </div>

          {alert.invoice && (
            <div className="mt-4">
              <Link
                href="/dashboard/actions"
                className="text-sm font-medium text-red-700 hover:underline"
              >
                Review actions →
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}