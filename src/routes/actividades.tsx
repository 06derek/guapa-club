import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero, SampleNotice } from "@/components/site/section-heading";
import { ActivityCard } from "@/components/site/activity-card";
import { activitiesQuery } from "@/lib/public-content";

export const Route = createFileRoute("/actividades")({
  head: () => ({
    meta: [
      { title: "Actividades · GUAPA FES Acatlán" },
      { name: "description", content: "Talleres, simulacros y concursos recientes del grupo GUAPA de la FES Acatlán." },
      { property: "og:title", content: "Actividades · GUAPA FES Acatlán" },
      { property: "og:description", content: "Talleres, simulacros y concursos recientes de GUAPA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(activitiesQuery),
  component: ActividadesPage,
});

function ActividadesPage() {
  const { data } = useSuspenseQuery(activitiesQuery);
  const list = data.items;
  return (
    <>
      <PageHero eyebrow="actividades" title="Actividades recientes">
        Talleres, simulacros y sesiones del grupo, de la más reciente a la más antigua.
      </PageHero>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {data.isSample ? <SampleNotice /> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))}
        </div>
      </section>
    </>
  );
}
