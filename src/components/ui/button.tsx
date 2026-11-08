import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "default" | "outline" | "ghost" | "secondary" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium tracking-tight transition-all duration-200 ease-out select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-0 " +
  "disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]";

const variants: Record<Variant, string> = {
  default:
    "bg-orange-500 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_6px_20px_-6px_rgba(249,115,22,0.6)] hover:bg-orange-500/90",
  outline:
    "border border-white/15 bg-white/[0.03] text-white backdrop-blur-xl hover:bg-white/[0.08] hover:border-white/25",
  ghost:
    "bg-transparent text-white/80 hover:bg-white/[0.07] hover:text-white",
  secondary:
    "bg-white/[0.08] text-white hover:bg-white/[0.12] backdrop-blur-xl",
  destructive:
    "bg-red-500/90 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_6px_20px_-6px_rgba(239,68,68,0.6)] hover:bg-red-500",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
  icon: "h-10 w-10 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "md", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
);

Button.displayName = "Button";
