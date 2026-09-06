"use client";

import { useState } from "react";

import { apiFetch } from "@/lib/api/client";


type RiskAssessment = {
  summary: string;
  recommendation: string;
};


type Props = {
  invoiceId: number;
};


export default function GenerateRiskAssessmentButton({
  invoiceId,
}: Props) {
  const [assessment, setAssessment] =
    useState<RiskAssessment | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  async function handleGenerate() {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ml/risk/invoices/${invoiceId}/explain`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to generate AI assessment"
        );
      }

      const data =
        await response.json();

      setAssessment(
        data.explanation
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }


  if (assessment) {
    return (
      <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <div>
          <p className="text-sm font-medium text-[#5B6472]">
            Ralvia AI
          </p>

          <h2 className="mt-1 text-lg font-semibold text-[#14213D]">
            AI Assessment
          </h2>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8A93A3]">
            Assessment
          </p>

          <p className="mt-2 text-sm leading-6 text-[#374151]">
            {assessment.summary}
          </p>
        </div>

        <div className="mt-6 rounded-xl bg-[#F8F9FB] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8A93A3]">
            Recommended action
          </p>

          <p className="mt-2 text-sm font-medium leading-6 text-[#14213D]">
            {assessment.recommendation}
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-5 text-sm font-semibold text-[#14213D] hover:underline disabled:opacity-50"
        >
          {loading
            ? "Regenerating..."
            : "Regenerate assessment"}
        </button>
      </div>
    );
  }


  return (
    <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-6">
      <p className="text-sm font-medium text-[#5B6472]">
        Ralvia AI
      </p>

      <h2 className="mt-1 text-lg font-semibold text-[#14213D]">
        AI Assessment
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
        Generate a business-friendly explanation
        of this machine-learning risk prediction
        and a recommended next action.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-5 rounded-xl bg-[#14213D] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Generating..."
          : "Generate AI Assessment"}
      </button>
    </div>
  );
}