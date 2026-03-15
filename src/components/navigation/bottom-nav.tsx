"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const navItems = [
  { href: "/dashboard", label: "ホーム", icon: "home" },
  { href: "/expenses", label: "支出", icon: "receipt" },
  { href: "/settlements", label: "精算", icon: "handshake" },
  { href: "/accounts", label: "口座", icon: "credit-card" },
  { href: "/settings", label: "設定", icon: "settings" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
      <ul className="flex">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={clsx(
                  "flex flex-col items-center gap-0.5 py-2 text-xs transition-colors",
                  isActive ? "text-[#C4A882]" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <span
                  className="text-xl"
                  style={{ fontFamily: "lucide" }}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
