import * as React from "react";

export interface AvatarGroupProps {
  people: { name: string; src?: string }[];
  max?: number;
  className?: string;
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function AvatarGroup({ people, max = 4, className = "" }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;

  return (
    <div className={["flex", className].join(" ")}>
      {shown.map((person, i) => (
        <span
          key={person.name}
          title={person.name}
          className={[
            "grid size-[38px] place-items-center overflow-hidden rounded-full border-2 border-black",
            "text-[11px] font-medium transition-transform duration-200 hover:-translate-y-1",
            i === 0 ? "bg-sky-300 text-sky-950" : "-ml-2 bg-zinc-900 text-zinc-400",
          ].join(" ")}
        >
          {person.src ? <img src={person.src} alt={person.name} className="size-full object-cover" /> : initials(person.name)}
        </span>
      ))}
      {rest > 0 && (
        <span className="-ml-2 grid size-[38px] place-items-center rounded-full border-2 border-black bg-zinc-900 text-[11px] font-medium text-sky-300">
          +{rest}
        </span>
      )}
    </div>
  );
}
