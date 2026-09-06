import Link from "next/link";

import { getInvoices } from "@/lib/api/invoice";
import { getCustomers } from "@/lib/api/customer";

import AddInvoiceForm from "@/components/invoices/AddInvoiceForm";
import GenerateFollowUpButton from "@/components/invoices/GenerateFollowUpButton";
import ExportCsvButton from "@/components/invoices/ExportCsvButton";

function priorityStyle(priority: string) {
  if (priority === "high") return "text-[#B3261E]";
  if (priority === "medium") return "text-[#C08A2E]";
  return "text-[#5B6472]";
}

function statusStyle(status: string) {
  if (status === "overdue") return "text-[#B3261E]";
  if (status === "paid") return "text-[#2F6F4E]";
  return "text-[#5B6472]";
}

type Props = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function InvoicesPage({
  searchParams,
}: Props) {
  const [invoices, customers] = await Promise.all([
    getInvoices(),
    getCustomers(),
  ]);

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const params = await searchParams;

  const perPage = 5;

  const requestedPage = Number(params.page ?? "1");

  const totalPages = Math.max(
    1,
    Math.ceil(invoices.length / perPage)
  );

  const currentPage = Math.min(
    Math.max(requestedPage, 1),
    totalPages
  );

  const startIndex = (currentPage - 1) * perPage;

  const paginatedInvoices = invoices.slice(
    startIndex,
    startIndex + perPage
  );

  return (
    <>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-[#14213D]">
            Invoices
          </h1>

          <p className="mt-2 text-[#5B6472]">
            Manage and track your company invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportCsvButton />

          <a
            href="#add-invoice"
            className="rounded-md bg-[#14213D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1c2d52]"
          >
            Add new
          </a>
        </div>
      </div>

      <div className="mt-8 overflow-hidden overflow-x-auto rounded-md border border-[#D8DCE3] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#D8DCE3] text-left text-[#5B6472]">
              <th className="p-4 font-medium">Invoice</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Due date</th>
              <th className="p-4 font-medium">Priority</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-t border-[#D8DCE3] text-[#14213D] transition-colors hover:bg-[#FBFAF8]"
              >
                <td className="p-4">
                  {invoice.invoice_number}
                </td>

                <td className="p-4">
                  {invoice.customer.name}
                </td>

                <td className="p-4">
                  ${Number(invoice.amount).toLocaleString()}
                </td>

                <td className="p-4">
                  {invoice.due_date.split('T')[0]}
                </td>

                <td className="p-4">
                  <span
                    className={
                      "font-medium capitalize " +
                      priorityStyle(invoice.priority)
                    }
                  >
                    {invoice.priority}
                  </span>
                </td>

                <td className="p-4">
                  <span
                    className={
                      "font-medium capitalize " +
                      statusStyle(invoice.status)
                    }
                  >
                    {invoice.status}
                  </span>
                </td>

                <td className="p-4">
                  {invoice.status === "overdue" && (
                    <GenerateFollowUpButton
                      invoiceId={invoice.id}
                      initialFollowUp={
                        invoice.latest_ai_action
                      }
                    />
                  )}
                </td>
              </tr>
            ))}

            {invoices.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-[#5B6472]"
                >
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {invoices.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-[#5B6472]">
            Showing {startIndex + 1}–
            {Math.min(
              startIndex + perPage,
              invoices.length
            )}{" "}
            of {invoices.length}
          </p>

          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={`/dashboard/invoices?page=${
                  currentPage - 1
                }`}
                className="rounded-md border border-[#D8DCE3] px-3 py-2 text-sm text-[#14213D] transition-colors hover:bg-[#F5F3EF]"
              >
                Previous
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-md border border-[#D8DCE3] px-3 py-2 text-sm text-[#A0A6B0]">
                Previous
              </span>
            )}

            {Array.from(
              { length: totalPages },
              (_, index) => {
                const page = index + 1;

                return (
                  <Link
                    key={page}
                    href={`/dashboard/invoices?page=${page}`}
                    className={
                      page === currentPage
                        ? "rounded-md bg-[#14213D] px-3 py-2 text-sm text-white"
                        : "rounded-md border border-[#D8DCE3] px-3 py-2 text-sm text-[#14213D] transition-colors hover:bg-[#F5F3EF]"
                    }
                  >
                    {page}
                  </Link>
                );
              }
            )}

            {currentPage < totalPages ? (
              <Link
                href={`/dashboard/invoices?page=${
                  currentPage + 1
                }`}
                className="rounded-md border border-[#D8DCE3] px-3 py-2 text-sm text-[#14213D] transition-colors hover:bg-[#F5F3EF]"
              >
                Next
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-md border border-[#D8DCE3] px-3 py-2 text-sm text-[#A0A6B0]">
                Next
              </span>
            )}
          </div>
        </div>
      )}

      {/* Add invoice modal */}
      <div
        id="add-invoice"
        className="invoice-modal"
      >
        <a
          href="#"
          className="invoice-modal-overlay"
          aria-label="Close add invoice"
        />

        <div className="invoice-modal-panel">
          <div className="flex items-center justify-between border-b border-[#D8DCE3] p-6">
            <h2 className="font-serif text-xl text-[#14213D]">
              Add invoice
            </h2>

            <a
              href="#"
              aria-label="Close"
              className="text-lg leading-none text-[#5B6472] transition-colors hover:text-[#14213D]"
            >
              &#215;
            </a>
          </div>

          <div className="p-6">
            <AddInvoiceForm customers={customers} />
          </div>
        </div>
      </div>

      <style>{`
        .invoice-modal {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 50;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .invoice-modal:target {
          display: flex;
        }

        .invoice-modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(20, 33, 61, 0.5);
        }

        .invoice-modal-panel {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 32rem;
          max-height: 85vh;
          overflow-y: auto;
          border-radius: 0.5rem;
          background: #ffffff;
        }
      `}</style>
    </>
  );
}