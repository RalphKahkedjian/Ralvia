"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { useRouter } from "next/navigation";

type AgentResult = {
  message: string;
  invoices_scanned: number;
  actions_created: number;
};

export default function RunAgentButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState("");

  async function handleRunAgent() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/run`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Agent scan failed");
      }

      const data: AgentResult = await response.json();

      setResult(data);

      // Refresh dashboard data
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleRunAgent}
        disabled={loading}
        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Agent is scanning..." : "Run Finance Agent"}
      </button>

      {result && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4">
          <p className="font-medium text-gray-900">
            Agent scan completed
          </p>

          <p className="mt-1 text-sm text-gray-600">
            Scanned {result.invoices_scanned} invoices · Created{" "}
            {result.actions_created} new{" "}
            {result.actions_created === 1 ? "action" : "actions"}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}