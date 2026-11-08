import { HTMLAttributes } from "react";

type Variant = "default" | "secondary" | "outline" | "success" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  default:
    "bg-orange-500/15 text-orange-300 border border-orange-500/25",
  secondary:
    "bg-white/[0.06] text-white/70 border border-white/10",
  outline:
    "bg-transparent text-white/70 border border-white/15",
  success:
    "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  warning:
    "bg-yellow-500/15 text-yellow-300 border border-yellow-500/25",
  danger:
    "bg-red-500/15 text-red-300 border border-red-500/25",
};

export function Badge({ variant = "default", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-tight " +
        `backdrop-blur-xl ${variants[variant]} ${className}`
      }
      {...props}
    />
  );
}
