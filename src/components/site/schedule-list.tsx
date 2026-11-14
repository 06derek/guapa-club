import { Clock, MapPin } from "lucide-react";
import type { Schedule } from "@/content/site";

export function ScheduleList({ items }: { items: Schedule[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card">
      {items.map((s) => (
        <li
          key={`${s.day}-${s.start}-${s.activity}`}
          className="grid gap-2 px-5 py-4 transition-colors hover:bg-accent/50 sm:grid-cols-[8rem_9rem_1fr_auto] sm:items-center sm:gap-6"
        >
          <span className="font-display font-semibold">{s.day}</span>
          <span className="inline-flex items-center gap-2 font-mono text-sm text-gold">
            <Clock className="size-3.5" aria-hidden />
            {s.start}–{s.end}
          </span>
          <span className="text-sm">{s.activity}</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden />
            {s.place}
          </span>
        </li>
      ))}
    </ul>
  );
}
