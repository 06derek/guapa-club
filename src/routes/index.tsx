import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, CalendarDays, Cpu, Trophy, Users, BarChart3, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeCard } from "@/components/site/code-card";
import { SectionHeading, SampleNotice } from "@/components/site/section-heading";
import { ActivityCard } from "@/components/site/activity-card";
import { ScheduleList } from "@/components/site/schedule-list";
import { club, pillars, contact } from "@/content/site";
import { activitiesQuery, schedulesQuery } from "@/lib/public-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GUAPA · Algoritmia y Programación Avanzada | FES Acatlán" },
      {
        name: "description",
        content:
          "Grupo Universitario de Algoritmia y Programación Avanzada de la FES Acatlán: entrenamiento, recursos y competencias de programación.",
      },
      { property: "og:title", content: "GUAPA · Algoritmia y Programación Avanzada" },
      {
        property: "og:description",
        content: "Comunidad de programación competitiva de la FES Acatlán, UNAM.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(activitiesQuery),
      context.queryClient.ensureQueryData(schedulesQuery),
    ]),
  component: Index,
});

const pillarIcons = { comunidad: Users, competencia: Trophy, aprendizaje: BookOpen, tecnologia: Cpu } as const;

const platformFeatures = [
  { icon: BarChart3, title: "Scoreboard con Codeforces", text: "Problemas resueltos por miembro y por periodo." },
  { icon: Swords, title: "Equipos de hasta 5", text: "Integra equipos y consulta sus estadísticas." },
  { icon: BookOpen, title: "Repositorio de recursos", text: "Guías y material de estudio en un solo lugar." },
  { icon: CalendarDays, title: "Calendario de competencias", text: "Próximos concursos, siempre a la vista." },
];

function Index() {
  const { data: acts } = useSuspenseQuery(activitiesQuery);
  const { data: sched } = useSuspenseQuery(schedulesQuery);
  const recent = acts.items.slice(0, 3);
  return (
    <>
      {/* Portada */}
      <section className="relative -mt-16 overflow-hidden pt-16">
        <div className="bg-grid mask-fade-b absolute inset-0" aria-hidden />
        <div className="bg-hero absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-10 sm:gap-14 sm:px-6 sm:pt-14 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
          <div className="min-w-0">
            <p className="animate-fade-up font-mono text-[11px] uppercase tracking-[0.16em] text-gold sm:text-xs sm:tracking-[0.2em]">
              {`// ${club.institution} · ${club.parent}`}
            </p>
            <h1 className="animate-fade-up mt-5 text-[2.6rem] font-bold leading-[1.05] [animation-delay:80ms] min-[400px]:text-5xl sm:text-6xl lg:text-7xl">
              Algoritmia que se <span className="text-brand-gradient">entrena en equipo.</span>
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-base text-muted-foreground sm:text-lg [animation-delay:160ms]">
              {club.fullName}. Resolvemos problemas, competimos y aprendemos juntos.
            </p>
            <div className="animate-fade-up mt-8 flex flex-wrap gap-3 [animation-delay:240ms]">
              <Button asChild variant="gold" size="lg" className="w-full sm:w-auto">
                <Link to="/actividades">
                  Ver actividades <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="glass" size="lg" className="w-full sm:w-auto">
                <Link to="/horarios">Horarios de entrenamiento</Link>
              </Button>
            </div>
          </div>
          <div className="animate-fade-up min-w-0 [animation-delay:200ms]">
            <CodeCard />
          </div>
        </div>
      </section>

      {/* Qué es GUAPA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="quiénes somos" title="Un grupo para crecer como programador">
          {club.purpose}
        </SectionHeading>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => {
            const Icon = pillarIcons[p.key];
            return (
              <div
                key={p.key}
                className="card-interactive animate-fade-up rounded-xl border border-border bg-card p-6 shadow-card"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Horarios */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow="horarios"
            title="Cuándo entrenamos"
            action={
              <Button asChild variant="link" className="px-0">
                <Link to="/horarios">
                  Ver todos <ArrowRight />
                </Link>
              </Button>
            }
          />
          {sched.isSample ? (
            <div className="mt-4">
              <SampleNotice />
            </div>
          ) : null}
          <div className="mt-8">
            <ScheduleList items={sched.items} />
          </div>
        </div>
      </section>

      {/* Actividades */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="actividades recientes"
          title="Lo último en GUAPA"
          action={
            <Button asChild variant="link" className="px-0">
              <Link to="/actividades">
                Ver historial <ArrowRight />
              </Link>
            </Button>
          }
        />
        {acts.isSample ? (
          <div className="mt-4">
            <SampleNotice />
          </div>
        ) : null}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {recent.map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))}
        </div>
      </section>

      {/* Plataforma */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card sm:p-12">
          <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
          <div className="relative">
            <Badge variant="gold">Próximamente para miembros</Badge>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">
              Tu progreso competitivo, medido con datos reales.
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {platformFeatures.map((f) => (
                <div key={f.title}>
                  <f.icon className="size-5 text-gold" aria-hidden />
                  <h3 className="mt-3 font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-border pt-12 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">¿Quieres unirte a GUAPA?</h2>
            <p className="mt-2 text-muted-foreground">Escríbenos a {contact.email} o visítanos en el CEDETEC.</p>
          </div>
          <Button asChild variant="gold" size="lg">
            <Link to="/contacto">
              Contacto <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
