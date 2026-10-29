import * as React from "react";

export interface FloatingInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  label: string;
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, id, className = "", ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    return (
      <div className={["relative w-full", className].join(" ")}>
        <input
          ref={ref}
          id={inputId}
          placeholder=" "
          className={[
            "peer h-[52px] w-full rounded-xl border border-white/15 bg-zinc-950 px-3.5 pb-1 pt-5",
            "text-sm text-zinc-100 outline-none transition",
            "focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10",
          ].join(" ")}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={[
            "pointer-events-none absolute left-3.5 top-1.5 text-[11px] text-sky-300 transition-all",
            "peer-placeholder-shown:top-[15px] peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500",
            "peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-sky-300",
          ].join(" ")}
        >
          {label}
        </label>
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";
