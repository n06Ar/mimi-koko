import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

type Padding = "none" | "sm" | "md" | "lg";
type Shadow = "none" | "sm" | "md";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  shadow?: Shadow;
}

const paddingClasses: Record<Padding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const shadowClasses: Record<Shadow, string> = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
};

export function Card({
  padding = "md",
  shadow = "sm",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl bg-white",
        paddingClasses[padding],
        shadowClasses[shadow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
