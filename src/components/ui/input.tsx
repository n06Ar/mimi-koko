"use client";

import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#3D3D3D]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          "rounded-lg border px-3 py-2 text-[#3D3D3D] outline-none transition-colors",
          "border-gray-300 bg-white",
          "focus:border-[#C4A882] focus:ring-1 focus:ring-[#C4A882]",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
