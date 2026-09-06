import type { Customer } from "@/types/customer";
import { getServerAuthHeaders } from "@/lib/api/serverAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getCustomers(): Promise<Customer[]> {
  const response = await fetch(`${BACKEND_URL}/api/customers`, {
    headers: await getServerAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }

  return response.json();
}