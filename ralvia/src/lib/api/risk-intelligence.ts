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
    const errorText = await response.text();

    console.error("Risk Intelligence status:", response.status);
    console.error("Risk Intelligence response:", errorText);

    throw new Error(
      `Failed to load risk intelligence: ${response.status}`
    );
  }

  return response.json();
}