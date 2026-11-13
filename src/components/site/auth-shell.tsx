import type { ReactNode } from "react";

export function AuthShell({ eyebrow, title, subtitle, children, footer }: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid mask-fade-b absolute inset-0" aria-hidden />
      <div className="bg-hero absolute inset-0" aria-hidden />
      <div className="relative mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
        <p className="animate-fade-up font-mono text-xs uppercase tracking-[0.2em] text-gold">{`// ${eyebrow}`}</p>
        <h1 className="animate-fade-up mt-3 text-3xl font-bold [animation-delay:60ms] sm:text-4xl">{title}</h1>
        {subtitle ? (
          <p className="animate-fade-up mt-2 text-muted-foreground [animation-delay:120ms]">{subtitle}</p>
        ) : null}
        <div className="animate-fade-up mt-8 rounded-2xl border border-border bg-card/90 p-6 shadow-card backdrop-blur [animation-delay:160ms] sm:p-8">
          {children}
        </div>
        {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </section>
  );
}

export function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  );
}
