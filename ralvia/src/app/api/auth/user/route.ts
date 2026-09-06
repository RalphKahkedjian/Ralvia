import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const FRONTEND_URL =
  process.env.FRONTEND_URL ?? "http://localhost:3000";

export async function GET() {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(`${BACKEND_URL}/api/user`, {
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
      Origin: FRONTEND_URL,
      Referer: `${FRONTEND_URL}/`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, {
      status: response.status,
    });
  }

  return NextResponse.json(data);
}