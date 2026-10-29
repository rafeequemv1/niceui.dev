import * as React from "react";

export interface MarqueeProps {
  children: React.ReactNode;
  duration?: number;
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({ children, duration = 24, pauseOnHover = true, className = "" }: MarqueeProps) {
  return (
    <div
      className={[
        "group w-full overflow-hidden",
        "[mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]",
        className,
      ].join(" ")}
    >
      <style>{"@keyframes nice-marquee{to{transform:translateX(calc(-50% - 6px))}}"}</style>
      <div
        className={["flex w-max gap-3", pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""].join(" ")}
        style={{ animation: "nice-marquee " + duration + "s linear infinite" }}
      >
        {children}
        <div aria-hidden className="contents">
          {children}
        </div>
      </div>
    </div>
  );
}
