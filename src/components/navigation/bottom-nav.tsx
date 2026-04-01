"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Home, CreditCard, ArrowRightLeft, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navItems: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/dashboard", label: "ホーム", Icon: Home },
  { href: "/expenses", label: "支出", Icon: CreditCard },
  { href: "/settlements", label: "精算", Icon: ArrowRightLeft },
  { href: "/settings", label: "設定", Icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white" style={{ borderColor: "#E8E4DC", height: "60px" }}>
      <ul className="flex h-full items-center justify-around px-2">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={clsx(
                  "flex flex-col items-center gap-1 py-2 text-[10px] transition-colors",
                  isActive ? "font-semibold text-[#C4A882]" : "font-normal text-[#9EA8B0] hover:text-gray-500"
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
