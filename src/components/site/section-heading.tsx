import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  children,
  className,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">{`// ${eyebrow}`}</p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h2>
        {children ? <p className="mt-3 text-muted-foreground">{children}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function SampleNotice() {
  return (
    <p className="inline-flex items-center gap-2 rounded-md border border-dashed border-gold/40 bg-gold/5 px-3 py-1.5 font-mono text-xs text-gold">
      Datos de ejemplo · pendientes de confirmar
    </p>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="bg-grid mask-fade-b absolute inset-0" aria-hidden />
      <div className="bg-hero absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-16 sm:px-6 sm:pt-20">
        <p className="animate-fade-up font-mono text-xs uppercase tracking-[0.2em] text-gold">{`// ${eyebrow}`}</p>
        <h1 className="animate-fade-up mt-3 text-4xl font-bold [animation-delay:80ms] sm:text-5xl">{title}</h1>
        {children ? (
          <div className="animate-fade-up mt-4 max-w-2xl text-lg text-muted-foreground [animation-delay:160ms]">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
