import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SampleNotice } from "@/components/site/section-heading";
import { ScheduleList } from "@/components/site/schedule-list";
import { schedules } from "@/content/site";

export const Route = createFileRoute("/horarios")({
  head: () => ({
    meta: [
      { title: "Horarios · GUAPA FES Acatlán" },
      { name: "description", content: "Días, horas y lugares de entrenamiento del grupo GUAPA en el CEDETEC." },
      { property: "og:title", content: "Horarios · GUAPA FES Acatlán" },
      { property: "og:description", content: "Días, horas y lugares de entrenamiento de GUAPA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HorariosPage,
});

function HorariosPage() {
  return (
    <>
      <PageHero eyebrow="horarios" title="Horarios de entrenamiento">
        Sesiones abiertas para estudiantes de la FES Acatlán.
      </PageHero>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SampleNotice />
        <div className="mt-8">
          <ScheduleList items={schedules} />
        </div>
      </section>
    </>
  );
}
