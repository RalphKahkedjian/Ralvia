import type {
  FinanceInsightsResponse,
} from "@/types/finance-insights";

import { getServerAuthHeaders } from "@/lib/api/serverAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getFinanceInsights():
  Promise<FinanceInsightsResponse> {

  const response = await fetch(
    `${API_URL}/finance-insights`,
    {
      headers: await getServerAuthHeaders(),
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