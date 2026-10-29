import * as React from "react";

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function ShimmerButton({ children, className = "", ...props }: ShimmerButtonProps) {
  return (
    <button
      className={[
        "group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full",
        "border border-sky-300/30 bg-black px-6 text-sm font-medium text-sky-100",
        "transition-colors duration-300 hover:border-sky-300/60",
        className,
      ].join(" ")}
      {...props}
    >
      <style>{"@keyframes nice-shimmer{0%{transform:translateX(-100%)}60%,100%{transform:translateX(100%)}}"}</style>
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-300/25 to-transparent"
        style={{ animation: "nice-shimmer 2.6s ease-in-out infinite" }}
      />
      <span
        aria-hidden
        className="absolute inset-x-6 -bottom-px h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent"
      />
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  );
}
