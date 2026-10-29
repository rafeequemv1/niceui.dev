"use client";

import * as React from "react";

export interface SliderProps {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  format?: (value: number) => string;
  onValueChange?: (value: number) => void;
  className?: string;
}

export function Slider({
  label,
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 50,
  format = (v) => String(v),
  onValueChange,
  className = "",
}: SliderProps) {
  const [value, setValue] = React.useState(defaultValue);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={["w-full", className].join(" ")}>
      {label && (
        <div className="mb-3.5 flex justify-between text-[13px] text-zinc-400">
          <span>{label}</span>
          <span className="font-mono text-zinc-100">{format(value)}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => {
          const next = Number(e.target.value);
          setValue(next);
          onValueChange?.(next);
        }}
        style={{ background: "linear-gradient(90deg,#7dd3fc " + pct + "%,#1c1e22 " + pct + "%)" }}
        className={[
          "h-1 w-full cursor-pointer appearance-none rounded-full outline-none",
          "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(125,211,252,.25)]",
          "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white",
        ].join(" ")}
      />
    </div>
  );
}
