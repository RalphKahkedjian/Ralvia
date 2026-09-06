"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/invoices", label: "Invoices" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/risk", label: "Risk Intelligence", },
{
  href: "/dashboard/customer-intelligence",
  label: "Customer Intelligence",
},
{
  href: "/dashboard/finance-insights",
  label: "Finance Insights",
},
  { href: "/dashboard/actions", label: "Action Center" },
  { href: "/dashboard/chat", label: "Ask Ralvia" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-10 flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              block w-full rounded-lg px-4 py-3
              text-left text-[15px] font-medium
              transition-all duration-200
              ${
                isActive
                  ? "bg-white text-[#14213D] shadow-sm"
                  : "text-white/65 hover:bg-white/5 hover:text-white"
              }
            `}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}