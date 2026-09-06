"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/api/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      await register({
        name,
        company_name: companyName,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-[#FBFAF8]">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[#14213D] text-white px-14 py-12">
        <span className="font-serif text-xl tracking-tight cursor-pointer" onClick={()=> {
          router.push('/')
        }}>Ralvia</span>

        <div className="max-w-sm">
          <h2 className="font-serif text-4xl leading-tight">
            Finance operations,
            <br />
            finally calm.
          </h2>
          <p className="mt-5 text-white/70 leading-relaxed">
            Ralvia watches your invoices, flags what needs attention, and
            drafts the follow-ups. You stay in control, without staying
            in the weeds.
          </p>
        </div>

        <p className="text-sm text-white/40">
          &copy; {new Date().getFullYear()} Ralvia
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-8 py-10 sm:px-12 lg:px-20">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl text-[#14213D]">
            Create your account
          </h1>
          <p className="mt-2 text-[#5B6472]">
            Set up your workspace in a couple of minutes.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-7">
            <Field
              label="Name"
              type="text"
              value={name}
              onChange={setName}
              autoComplete="name"
            />

            <Field
              label="Company name"
              type="text"
              value={companyName}
              onChange={setCompanyName}
              autoComplete="organization"
            />

            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />

            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />

            <Field
              label="Confirm password"
              type="password"
              value={passwordConfirmation}
              onChange={setPasswordConfirmation}
              autoComplete="new-password"
            />

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-md bg-[#14213D] py-3 font-medium text-white transition-colors hover:bg-[#1c2d52]"
            >
              Create account
            </button>

            <p className="text-center text-sm text-[#5B6472]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#14213D] underline underline-offset-2"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[#14213D]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="mt-2 w-full border-b border-[#D8DCE3] bg-transparent py-2 text-[#14213D] outline-none transition-colors focus:border-[#14213D]"
      />
    </label>
  );
}