"use client";

import { clsx } from "clsx";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className={clsx("flex cursor-pointer items-center gap-2", disabled && "cursor-not-allowed opacity-50")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C4A882] focus:ring-offset-2",
          checked ? "bg-[#C4A882]" : "bg-gray-300"
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "left-0.5 translate-x-5" : "left-0.5 translate-x-0"
          )}
        />
      </button>
      {label && <span className="text-sm text-[#3D3D3D]">{label}</span>}
    </label>
  );
}
