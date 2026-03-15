"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Home, Receipt, Handshake, CreditCard, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navItems: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/dashboard", label: "ホーム", Icon: Home },
  { href: "/expenses", label: "支出", Icon: Receipt },
  { href: "/settlements", label: "精算", Icon: Handshake },
  { href: "/accounts", label: "口座", Icon: CreditCard },
  { href: "/settings", label: "設定", Icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
      <ul className="flex">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={clsx(
                  "flex flex-col items-center gap-0.5 py-2 text-xs transition-colors",
                  isActive ? "text-[#C4A882]" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
