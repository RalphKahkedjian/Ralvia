import type { Invoice } from "@/types/invoice";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getInvoices(): Promise<Invoice[]> {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(`${BACKEND_URL}/api/invoices`, {
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
      Origin: "http://localhost:3000",
      Referer: "http://localhost:3000/",
    },
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