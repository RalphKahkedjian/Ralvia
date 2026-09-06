"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

export default function AddCustomerForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create customer");
      }

      setName("");
      setEmail("");
      setPhone("");

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
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Customer name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full border-b border-[#D8DCE3] bg-transparent py-2 text-[#14213D] outline-none transition-colors focus:border-[#14213D]"
            required
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border-b border-[#D8DCE3] bg-transparent py-2 text-[#14213D] outline-none transition-colors focus:border-[#14213D]"
          />
        </Field>

        <Field label="Phone">
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full border-b border-[#D8DCE3] bg-transparent py-2 text-[#14213D] outline-none transition-colors focus:border-[#14213D]"
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
        disabled={loading}
        className="mt-6 w-full rounded-md bg-[#14213D] py-3 font-medium text-white transition-colors hover:bg-[#1c2d52] disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add customer"}
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