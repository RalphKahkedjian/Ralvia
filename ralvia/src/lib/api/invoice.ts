import type { Invoice } from "@/types/invoice";
import { getServerAuthHeaders } from "@/lib/api/serverAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getInvoices(): Promise<Invoice[]> {
  const response = await fetch(`${BACKEND_URL}/api/invoices`, {
    headers: await getServerAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Invoice API status:", response.status);
    console.error("Invoice API response:", errorText);

    throw new Error(
      `Failed to fetch invoices: ${response.status}`
    );
  }

  return response.json();
}