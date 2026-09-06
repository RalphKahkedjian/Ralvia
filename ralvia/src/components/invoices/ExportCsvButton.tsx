"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api/client";

export default function ExportCsvButton() {
  const [loading, setLoading] = useState(false);

  async function exportCsv() {
    try {
      setLoading(true);

      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/export/csv`
      );

      if (!response.ok) {
        throw new Error("Could not export CSV.");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "ralvia-invoices.csv";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Could not export CSV."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={exportCsv}
      disabled={loading}
      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
    >
      {loading ? "Exporting..." : "Export CSV"}
    </button>
  );
}