import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { profileQuery, myRolesQuery, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Mi perfil · GUAPA" }, { name: "robots", content: "noindex" }] }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(profileQuery(context.userId)),
      context.queryClient.ensureQueryData(myRolesQuery(context.userId)),
    ]),
  component: PerfilPage,
});

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function PerfilPage() {
  const { userId } = Route.useRouteContext();
  const { user } = useAuth();
  const { data: profile } = useSuspenseQuery(profileQuery(userId));
  const { data: roles } = useSuspenseQuery(myRolesQuery(userId));

  if (!profile) {
    return <p className="mx-auto max-w-3xl px-4 py-16 text-muted-foreground">No se encontró tu perfil.</p>;
  }

  const rows = [
    { label: "Nombre completo", value: profile.full_name },
    { label: "Usuario", value: `@${profile.username}`, mono: true },
    { label: "Correo", value: user?.email ?? "—", mono: true },
    {
      label: "Miembro desde",
      value: new Date(profile.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }),
    },
  ];

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-5">
        <span className="grid size-20 place-items-center rounded-2xl border border-gold/40 bg-gold/10 font-display text-2xl font-bold text-gold">
          {initials(profile.full_name)}
        </span>
        <div>
          <h1 className="text-3xl font-bold">{profile.full_name}</h1>
          <div className="mt-2 flex gap-2">
            {roles.map((r) => (
              <Badge key={r} variant={r === "admin" ? "gold" : "mono"}>
                {r === "admin" ? "Administrador" : "Miembro"}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <dl className="mt-10 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {rows.map((r) => (
          <div key={r.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
            <dt className="text-sm text-muted-foreground">{r.label}</dt>
            <dd className={r.mono ? "break-all font-mono text-sm" : "text-sm font-medium"}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
