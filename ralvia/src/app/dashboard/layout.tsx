import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import LogoutButton from "@/components/LogoutButton";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardShell from "@/components/dashboard/DashboardShell";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(`${BACKEND_URL}/api/user`, {
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
      Origin: "http://localhost:3000",
      Referer: "http://localhost:3000/",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    redirect("/login");
  }

  return (
    <DashboardShell nav={<DashboardNav />} logout={<LogoutButton />}>
      {children}
    </DashboardShell>
  );
}