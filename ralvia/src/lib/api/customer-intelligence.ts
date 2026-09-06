import { cookies } from "next/headers";

import type {
  CustomerIntelligenceResponse,
} from "@/types/customer-intelligence";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

export async function getCustomerIntelligence():
  Promise<CustomerIntelligenceResponse> {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map(
      (cookie) =>
        `${cookie.name}=${cookie.value}`
    )
    .join("; ");

  const response = await fetch(
    `${API_URL}/customer-intelligence`,
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
      "Failed to load customer intelligence"
    );
  }

  return response.json();
}