import * as React from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-sky-300 text-sky-950 shadow-[0_0_0_1px_rgba(125,211,252,.4),0_8px_32px_-8px_rgba(56,189,248,.6)] hover:bg-sky-200",
  outline: "border border-white/15 text-zinc-100 hover:border-white/30 hover:bg-white/[.03]",
  ghost: "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3.5 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full font-medium",
        "transition-all duration-200 active:scale-[.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      ].join(" ")}
      {...props}
    />
  )
);
Button.displayName = "Button";
