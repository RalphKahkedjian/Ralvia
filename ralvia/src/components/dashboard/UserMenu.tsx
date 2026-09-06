"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

type Props = {
  name: string;
  email: string;
};

export default function UserMenu({
  name,
  email,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-lg border border-[#D8DCE3] bg-white px-4 py-2.5 text-left shadow-sm transition hover:bg-[#F7F6F3]"
      >
        <div>
          <p className="text-sm font-semibold text-[#14213D]">
            {name}
          </p>

          <p className="max-w-[180px] truncate text-xs text-[#7A8290]">
            {email}
          </p>
        </div>

        <span className="text-xs text-[#7A8290]">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-lg border border-[#D8DCE3] bg-white shadow-lg">
          <div className="border-b border-[#E5E7EB] px-4 py-3">
            <p className="text-sm font-semibold text-[#14213D]">
              {name}
            </p>

            <p className="mt-1 truncate text-xs text-[#7A8290]">
              {email}
            </p>
          </div>

          <div className="p-2">
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-[#14213D] transition hover:bg-[#F5F3EF]"
            >
              Profile
            </Link>

            <div className="mt-1 rounded-md px-3 py-2 hover:bg-[#F5F3EF]">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}