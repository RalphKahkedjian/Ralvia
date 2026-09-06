"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="text-left text-gray-400 hover:text-white"
    >
      Logout
    </button>
  );
}