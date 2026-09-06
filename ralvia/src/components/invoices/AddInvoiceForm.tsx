"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer } from "@/types/customer";
import { apiFetch } from "@/lib/api/client";

type AddInvoiceFormProps = {
  customers: Customer[];
};

export default function AddInvoiceForm({
  customers,
}: AddInvoiceFormProps) {
  const router = useRouter();

  const [customerId, setCustomerId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("pending");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_id: Number(customerId),
            invoice_number: invoiceNumber,
            amount: Number(amount),
            issue_date: issueDate,
            due_date: dueDate,
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create invoice");
      }

      setCustomerId("");
      setInvoiceNumber("");
      setAmount("");
      setIssueDate("");
      setDueDate("");
      setStatus("pending");

      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Customer">
          <Select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            <option value="">Select customer</option>

            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Invoice number">
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="mt-2 w-full border-b border-[#D8DCE3] bg-transparent py-2 text-[#14213D] outline-none transition-colors focus:border-[#14213D]"
            required
          />
        </Field>

        <Field label="Amount">
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full border-b border-[#D8DCE3] bg-transparent py-2 text-[#14213D] outline-none transition-colors focus:border-[#14213D]"
            required
          />
        </Field>

        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </Select>
        </Field>

        <Field label="Issue date">
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="mt-2 w-full border-b border-[#D8DCE3] bg-transparent py-2 text-[#14213D] outline-none transition-colors focus:border-[#14213D]"
            required
          />
        </Field>

        <Field label="Due date">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-2 w-full border-b border-[#D8DCE3] bg-transparent py-2 text-[#14213D] outline-none transition-colors focus:border-[#14213D]"
            required
          />
        </Field>
      </div>

      {error && (
        <p className="mt-4 text-sm text-[#B3261E]" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || customers.length === 0}
        className="mt-6 w-full rounded-md bg-[#14213D] py-3 font-medium text-white transition-colors hover:bg-[#1c2d52] disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create invoice"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[#14213D]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <div className="relative mt-2">
      <select
        {...props}
        className="w-full appearance-none border-b border-[#D8DCE3] bg-transparent py-2 pr-6 text-[#14213D] outline-none transition-colors focus:border-[#14213D]"
      />
      <svg
        className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B6472]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}