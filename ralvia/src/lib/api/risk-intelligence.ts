import { cookies } from "next/headers";

import type {
  RiskIntelligenceResponse,
} from "@/types/risk-intelligence";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL;


export async function getRiskIntelligence():
  Promise<RiskIntelligenceResponse> {

  const cookieStore = await cookies();

  const response = await fetch(
    `${API_URL}/ml/risk/intelligence`,
    {
      headers: {
        Accept: "application/json",
        Cookie: cookieStore.toString(),
        Origin: "http://localhost:3000",
        Referer: "http://localhost:3000/",
      },
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