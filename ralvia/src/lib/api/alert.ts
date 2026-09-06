import { Alert } from "@/types/alert";
import { getServerAuthHeaders } from "@/lib/api/serverAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getAlerts(): Promise<Alert[]> {
  const response = await fetch(
    `${BACKEND_URL}/api/alerts`,
    {
      headers: await getServerAuthHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch alerts");
  }

  return response.json();
}