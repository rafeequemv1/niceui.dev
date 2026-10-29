"use client";

import * as React from "react";

export interface CommandItem {
  label: string;
  hint?: string;
  onSelect?: () => void;
}

export interface CommandPaletteProps {
  items: CommandItem[];
  placeholder?: string;
  className?: string;
}

export function CommandPalette({ items, placeholder = "Search…", className = "" }: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const results = items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  React.useEffect(() => setActive(0), [query]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      results[active]?.onSelect?.();
    }
  };

  return (
    <div
      className={[
        "w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/15 bg-zinc-950",
        "shadow-[0_30px_80px_-30px_rgba(56,189,248,.25)]",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5 border-b border-white/10 px-3.5 py-3 text-zinc-500">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
        />
        <kbd className="rounded-md border border-white/15 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">⌘K</kbd>
      </div>
      <ul role="listbox" className="p-1.5">
        {results.length === 0 && <li className="px-2.5 py-6 text-center text-[13px] text-zinc-500">No results</li>}
        {results.map((item, i) => (
          <li
            key={item.label}
            role="option"
            aria-selected={i === active}
            onMouseEnter={() => setActive(i)}
            onClick={item.onSelect}
            className={[
              "flex cursor-pointer justify-between rounded-lg px-2.5 py-2 text-[13px] transition-colors",
              i === active ? "bg-sky-300/10 text-zinc-100" : "text-zinc-400",
            ].join(" ")}
          >
            <span>{item.label}</span>
            {item.hint && (
              <span className={["font-mono text-[11px]", i === active ? "text-sky-300" : "text-zinc-500"].join(" ")}>
                {item.hint}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
