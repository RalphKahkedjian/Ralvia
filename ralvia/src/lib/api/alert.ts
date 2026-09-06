import { cookies } from "next/headers";
import { Alert } from "@/types/alert";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getAlerts(): Promise<Alert[]> {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(
    `${BACKEND_URL}/api/alerts`,
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
    throw new Error("Failed to fetch alerts");
  }

  return response.json();
}