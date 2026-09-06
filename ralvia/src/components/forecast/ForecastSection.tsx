"use client";

import { useEffect, useState } from "react";
import InvoiceForecastChart from "./InvoiceForecastChart";
import type { InvoiceForecast } from "@/types/forecast";

export default function ForecastSection() {
  const [data, setData] = useState<InvoiceForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadForecast() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/forecast/invoices`,
          {
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Could not load forecast.");
        }

        const result: InvoiceForecast = await response.json();

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load forecast."
        );
      } finally {
        setLoading(false);
      }
    }

    loadForecast();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-5">
        Loading forecast...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-5">
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return <InvoiceForecastChart data={data} />;
}