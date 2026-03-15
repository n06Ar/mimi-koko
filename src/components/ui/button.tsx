"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-[#C4A882] text-white hover:bg-[#b5987a]",
  secondary: "bg-[#9EA8B0] text-white hover:bg-[#8e98a0]",
  ghost: "bg-transparent text-[#3D3D3D] hover:bg-gray-100",
  outline: "bg-transparent border border-[#C4A882] text-[#C4A882] hover:bg-[#C4A882] hover:text-white",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        clsx(
          "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#C4A882] focus:ring-offset-2",
          variantClasses[variant],
          sizeClasses[size],
          disabled && "opacity-50 cursor-not-allowed"
        ),
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
