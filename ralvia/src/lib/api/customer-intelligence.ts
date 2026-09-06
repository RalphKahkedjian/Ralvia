import type {
  CustomerIntelligenceResponse,
} from "@/types/customer-intelligence";

import { getServerAuthHeaders } from "@/lib/api/serverAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCustomerIntelligence():
  Promise<CustomerIntelligenceResponse> {

  const response = await fetch(
    `${API_URL}/customer-intelligence`,
    {
      headers: await getServerAuthHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load customer intelligence"
    );
  }

  return response.json();
}