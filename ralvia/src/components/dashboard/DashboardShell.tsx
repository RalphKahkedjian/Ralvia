"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Props = {
  nav: React.ReactNode;
  logout: React.ReactNode;
  children: React.ReactNode;
};

export default function DashboardShell({ nav, logout, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent background scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-[#FBFAF8]">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-[#D8DCE3] bg-[#14213D] px-5 py-4 text-white md:hidden">
        <span className="font-serif text-2xl leading-none tracking-tight">
          Ralvia
        </span>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-white/10"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col justify-between bg-[#14213D] px-5 py-7 text-white md:flex">
        <div className="w-full">
          <div className="px-3 text-left">
            <div className="mt-4 font-serif text-[32px] leading-none tracking-tight text-white">
              Ralvia
            </div>
          </div>

          {nav}
        </div>

        <div className="w-full border-t border-white/10 pt-5 text-left">
          {logout}
        </div>
      </aside>

      {/* Mobile full-screen menu */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#14213D] text-white md:hidden">
          <div className="flex items-center justify-between px-5 py-5">
            <span className="font-serif text-2xl leading-none tracking-tight">
              Ralvia
            </span>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-white/10"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-between overflow-y-auto px-5 pb-7">
            <div className="w-full">{nav}</div>

            <div className="w-full border-t border-white/10 pt-5 text-left">
              {logout}
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen px-6 py-8 md:ml-64 md:px-10 md:py-10">
        {children}
      </main>
    </div>
  );
}