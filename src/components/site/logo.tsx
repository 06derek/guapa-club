import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="GUAPA, inicio">
      <span className="grid size-9 place-items-center rounded-lg border border-gold/40 bg-gold/10 font-mono text-sm font-bold text-gold transition-transform group-hover:rotate-[-6deg]">
        {"{G}"}
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-tight">GUAPA</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          FES Acatlán
        </span>
      </span>
    </Link>
  );
}
