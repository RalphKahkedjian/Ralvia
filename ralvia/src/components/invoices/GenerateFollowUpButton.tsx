"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api/client";

type FollowUpAction = {
  id: number;
  subject: string;
  message: string;
  status: "pending" | "approved" | "rejected";
};

type Props = {
  invoiceId: number;
  initialFollowUp: FollowUpAction | null;
};

function statusStyle(status: string) {
  if (status === "approved") return "text-[#2F6F4E]";
  if (status === "rejected") return "text-[#B3261E]";
  return "text-[#5B6472]";
}

export default function GenerateFollowUpButton({
  invoiceId,
  initialFollowUp,
}: Props) {
  const [followUp, setFollowUp] =
    useState<FollowUpAction | null>(initialFollowUp);

  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(
    initialFollowUp?.subject ?? ""
  );
  const [message, setMessage] = useState(
    initialFollowUp?.message ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/follow-up`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to generate follow-up");
      }

      const result: FollowUpAction = await response.json();

      setFollowUp(result);

      // Put generated values into our edit fields
      setSubject(result.subject);
      setMessage(result.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!followUp) return;

    setSaving(true);
    setError("");

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ai-actions/${followUp.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject,
            message,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to save changes");
      }

      const result = await response.json();

      // Replace our local action with the updated DB action
      setFollowUp(result.action);

      setSubject(result.action.subject);
      setMessage(result.action.message);

      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    if (!followUp) return;

    setApproving(true);
    setError("");

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ai-actions/${followUp.id}/approve`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to approve follow-up");
      }

      const result = await response.json();

      setFollowUp(result.action);

      setSubject(result.action.subject);
      setMessage(result.action.message);

      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setApproving(false);
    }
  }

  function handleCancelEdit() {
    if (!followUp) return;

    // Restore saved DB values
    setSubject(followUp.subject);
    setMessage(followUp.message);
    setEditing(false);
  }

  return (
    <div className="min-w-[320px]">
      {/* No draft yet */}
      {!followUp && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-md bg-[#14213D] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1c2d52] disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate follow-up"}
        </button>
      )}

      {error && (
        <p className="mt-2 text-sm text-[#B3261E]" role="alert">
          {error}
        </p>
      )}

      {/* Draft exists */}
      {followUp && (
        <div className="rounded-md border border-[#D8DCE3] bg-[#FBFAF8] p-4">

          {/* EDIT MODE */}
          {editing ? (
            <>
              <label className="text-xs font-medium text-[#5B6472]">
                Subject
              </label>

              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full rounded-md border border-[#D8DCE3] bg-white px-3 py-2 text-sm text-[#14213D] outline-none transition-colors focus:border-[#14213D]"
              />

              <label className="mt-4 block text-xs font-medium text-[#5B6472]">
                Message
              </label>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="mt-1 w-full resize-y rounded-md border border-[#D8DCE3] bg-white px-3 py-2 text-sm text-[#14213D] outline-none transition-colors focus:border-[#14213D]"
              />

              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-md bg-[#14213D] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1c2d52] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>

                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="rounded-md border border-[#D8DCE3] bg-white px-3 py-2 text-sm font-medium text-[#5B6472] transition-colors hover:text-[#14213D]"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {/* VIEW MODE */}

              <p className="font-medium text-[#14213D]">
                {followUp.subject}
              </p>

              <p className="mt-2 whitespace-pre-line text-sm text-[#5B6472]">
                {followUp.message}
              </p>

              {/* Pending */}
              {followUp.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-md border border-[#D8DCE3] bg-white px-3 py-2 text-sm font-medium text-[#5B6472] transition-colors hover:text-[#14213D]"
                  >
                    Edit
                  </button>

                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="rounded-md bg-[#14213D] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1c2d52] disabled:opacity-50"
                  >
                    {approving ? "Approving..." : "Approve"}
                  </button>
                </div>
              )}

              {/* Approved / Rejected */}
              {(followUp.status === "approved" ||
                followUp.status === "rejected") && (
                <p
                  className={
                    "mt-3 text-sm font-medium capitalize " +
                    statusStyle(followUp.status)
                  }
                >
                  {followUp.status === "approved"
                    ? "\u2713 Approved"
                    : "Rejected"}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}