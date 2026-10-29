"use client";

import * as React from "react";

export interface SegmentedControlProps {
  options: string[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  className = "",
}: SegmentedControlProps) {
  const [inner, setInner] = React.useState(defaultValue ?? options[0]);
  const active = value ?? inner;
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [box, setBox] = React.useState({ left: 0, width: 0 });

  React.useLayoutEffect(() => {
    const el = refs.current[options.indexOf(active)];
    if (el) setBox({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active, options]);

  const select = (option: string) => {
    if (value === undefined) setInner(option);
    onValueChange?.(option);
  };

  return (
    <div
      role="tablist"
      className={["relative inline-flex rounded-full border border-white/15 p-[3px]", className].join(" ")}
    >
      <span
        aria-hidden
        className="absolute bottom-[3px] top-[3px] rounded-full bg-sky-300 transition-all duration-500 [transition-timing-function:cubic-bezier(.2,1.2,.4,1)]"
        style={{ left: box.left, width: box.width }}
      />
      {options.map((option, i) => (
        <button
          key={option}
          ref={(el) => {
            refs.current[i] = el;
          }}
          role="tab"
          aria-selected={active === option}
          onClick={() => select(option)}
          className={[
            "relative z-10 rounded-full px-[18px] py-1.5 text-[13px] transition-colors duration-300",
            active === option ? "font-medium text-sky-950" : "text-zinc-400 hover:text-zinc-200",
          ].join(" ")}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
