"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { AiAction } from "@/types/aiAction";

type Props = {
  initialAction: AiAction;
};

function statusStyle(status: string) {
  if (status === "approved") return "bg-[#EAF2ED] text-[#2F6F4E]";
  if (status === "pending") return "bg-[#FBF0DE] text-[#C08A2E]";
  return "bg-[#F2F3F5] text-[#5B6472]";
}

export default function AiActionCard({ initialAction }: Props) {
  const [action, setAction] = useState(initialAction);
  const [editing, setEditing] = useState(false);

  const [subject, setSubject] = useState(action.subject);
  const [message, setMessage] = useState(action.message);

  const [sending, setSending] = useState(false);

  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ai-actions/${action.id}`,
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

      setAction(result.action);
      setSubject(result.action.subject);
      setMessage(result.action.message);
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    setApproving(true);
    setError("");

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ai-actions/${action.id}/approve`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to approve action");
      }

      const result = await response.json();

      setAction(result.action);
      setSubject(result.action.subject);
      setMessage(result.action.message);
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setApproving(false);
    }
  }

  async function handleSend() {
    setSending(true);
    setError("");

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ai-actions/${action.id}/send`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to send email");
      }

      const result = await response.json();

      setAction(result.action);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSending(false);
    }
  }

  function handleCancel() {
    setSubject(action.subject);
    setMessage(action.message);
    setEditing(false);
  }

  return (
    <div className="rounded-md border border-[#D8DCE3] bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-[#14213D]">
            {action.invoice.invoice_number}
          </p>

          <p className="mt-1 text-sm text-[#5B6472]">
            {action.invoice.customer.name}
          </p>
        </div>

        <span
          className={
            "whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium capitalize " +
            statusStyle(action.status)
          }
        >
          {action.status}
        </span>
      </div>

      {editing ? (
        <div className="mt-4">
          <label className="text-sm font-medium text-[#14213D]">
            Subject
          </label>

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-2 w-full border-b border-[#D8DCE3] bg-transparent py-2 text-[#14213D] outline-none transition-colors focus:border-[#14213D]"
          />

          <label className="mt-5 block text-sm font-medium text-[#14213D]">
            Message
          </label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="mt-2 w-full rounded-md border border-[#D8DCE3] px-3 py-2 text-[#14213D] outline-none transition-colors focus:border-[#14213D]"
          />

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-[#14213D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1c2d52] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>

            <button
              onClick={handleCancel}
              disabled={saving}
              className="rounded-md border border-[#D8DCE3] px-4 py-2 text-sm font-medium text-[#5B6472] transition-colors hover:text-[#14213D]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <p className="font-medium text-[#14213D]">{action.subject}</p>

          <p className="mt-2 whitespace-pre-line text-sm text-[#5B6472]">
            {action.message}
          </p>

          {action.status === "pending" && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setEditing(true)}
                className="rounded-md border border-[#D8DCE3] px-4 py-2 text-sm font-medium text-[#5B6472] transition-colors hover:text-[#14213D]"
              >
                Edit
              </button>

              <button
                onClick={handleApprove}
                disabled={approving}
                className="rounded-md bg-[#14213D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1c2d52] disabled:opacity-50"
              >
                {approving ? "Approving..." : "Approve"}
              </button>
            </div>
          )}

          {action.status === "approved" && !action.sent_at && (
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm font-medium text-[#2F6F4E]">
                &#10003; Approved
              </span>

              <button
                onClick={handleSend}
                disabled={sending}
                className="rounded-md bg-[#14213D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1c2d52] disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send email"}
              </button>
            </div>
          )}

          {action.sent_at && (
            <p className="mt-4 text-sm font-medium text-[#2F6F4E]">
              &#10003; Email sent
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-[#B3261E]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}