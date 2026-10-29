import * as React from "react";

type Variant = "neutral" | "sky" | "outline";

const variants: Record<Variant, string> = {
  neutral: "bg-white/[.06] text-zinc-300",
  sky: "border border-sky-300/30 bg-sky-300/10 text-sky-300",
  outline: "border border-white/15 text-zinc-400",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  dot?: boolean;
}

export function Badge({ variant = "neutral", dot = false, className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {dot && <span className="size-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />}
      {children}
    </span>
  );
}
