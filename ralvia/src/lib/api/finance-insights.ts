import { cookies } from "next/headers";

import type {
  FinanceInsightsResponse,
} from "@/types/finance-insights";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

export async function getFinanceInsights():
  Promise<FinanceInsightsResponse> {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map(
      (cookie) =>
        `${cookie.name}=${cookie.value}`
    )
    .join("; ");

  const response = await fetch(
    `${API_URL}/finance-insights`,
    {
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
        Origin: "http://localhost:3000",
        Referer: "http://localhost:3000/",
      },

      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load finance insights"
    );
  }

  return response.json();
}