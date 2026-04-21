import { HTMLAttributes } from "react";

type Variant = "default" | "secondary" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  default: "bg-orange-500 text-white",
  secondary: "bg-white/5 text-gray-300",
  outline: "border border-gray-600 text-gray-300",
};

export function Badge({ variant = "default", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
