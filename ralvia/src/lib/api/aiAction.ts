import { AiAction } from "@/types/aiAction";
import { getServerAuthHeaders } from "@/lib/api/serverAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getAiActions(): Promise<AiAction[]> {
  const response = await fetch(
    `${BACKEND_URL}/api/ai-actions`,
    {
      headers: await getServerAuthHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch AI actions");
  }

  return response.json();
}