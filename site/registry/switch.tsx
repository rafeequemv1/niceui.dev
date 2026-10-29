"use client";

import * as React from "react";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  label,
  className = "",
}: SwitchProps) {
  const [inner, setInner] = React.useState(defaultChecked);
  const on = checked ?? inner;

  const toggle = () => {
    if (checked === undefined) setInner(!on);
    onCheckedChange?.(!on);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={toggle}
      className={[
        "relative inline-flex h-5 w-[34px] shrink-0 items-center rounded-full transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50 disabled:opacity-50",
        on ? "bg-sky-300" : "bg-zinc-800 ring-1 ring-inset ring-white/15",
        className,
      ].join(" ")}
    >
      <span
        className={[
          "absolute left-[3px] size-3.5 rounded-full transition-all duration-300",
          "[transition-timing-function:cubic-bezier(.2,1.4,.4,1)]",
          on ? "translate-x-3.5 bg-sky-950" : "bg-zinc-400",
        ].join(" ")}
      />
    </button>
  );
}
