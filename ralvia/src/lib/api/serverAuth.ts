// src/lib/api/serverAuth.ts

import { cookies } from "next/headers";

const FRONTEND_URL =
  process.env.FRONTEND_URL ?? "http://localhost:3000";

export async function getServerAuthHeaders() {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  return {
    Accept: "application/json",
    Cookie: cookieHeader,
    Origin: FRONTEND_URL,
    Referer: `${FRONTEND_URL}/`,
  };
}