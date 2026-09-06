import type {
  RiskIntelligenceResponse,
} from "@/types/risk-intelligence";

import { getServerAuthHeaders } from "@/lib/api/serverAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getRiskIntelligence():
  Promise<RiskIntelligenceResponse> {

  const response = await fetch(
    `${API_URL}/ml/risk/intelligence`,
    {
      headers: await getServerAuthHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load risk intelligence"
    );
  }

  return response.json();
}