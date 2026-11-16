import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BarChart3, BookOpen, CalendarDays, Swords, Trophy, UserRound, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { profileQuery, myRolesQuery } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({ meta: [{ title: "Mi panel · GUAPA" }, { name: "robots", content: "noindex" }] }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(profileQuery(context.userId)),
      context.queryClient.ensureQueryData(myRolesQuery(context.userId)),
    ]),
  component: PanelPage,
});

const upcoming = [
  { icon: BarChart3, title: "Codeforces", text: "Vincula tu cuenta y sigue tu progreso." },
  { icon: Trophy, title: "Scoreboard", text: "Problemas resueltos por periodo." },
  { icon: BookOpen, title: "Recursos", text: "Material de estudio del grupo." },
  { icon: CalendarDays, title: "Competencias", text: "Registra tus concursos externos." },
];

function PanelPage() {
  const { userId } = Route.useRouteContext();
  const { data: profile } = useSuspenseQuery(profileQuery(userId));
  const { data: roles } = useSuspenseQuery(myRolesQuery(userId));
  const isAdmin = roles.includes("admin");

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">{"// mi panel"}</p>
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
        Hola, {profile?.full_name.split(" ")[0] ?? "miembro"}
      </h1>
      <p className="mt-2 font-mono text-sm text-muted-foreground">@{profile?.username}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link to="/perfil" className="card-interactive flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-card">
          <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
            <UserRound className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold">Mi perfil</p>
            <p className="text-sm text-muted-foreground">Consulta tu información de miembro.</p>
          </div>
        </Link>
        <Link to="/equipos" className="card-interactive flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-card">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Swords className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">Equipos</p>
            <p className="text-sm text-muted-foreground">Crea equipos de hasta 5 integrantes.</p>
          </div>
        </Link>
        <Link to="/miembros" className="card-interactive flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-card">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">Miembros</p>
            <p className="text-sm text-muted-foreground">Consulta quiénes forman GUAPA.</p>
          </div>
        </Link>
        {isAdmin ? (
          <Link to="/admin" className="card-interactive flex items-center gap-4 rounded-xl border border-gold/40 bg-card p-6 shadow-card">
            <span className="grid size-11 place-items-center rounded-lg bg-gold/15 text-gold">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-semibold">Administración</p>
              <p className="text-sm text-muted-foreground">Usuarios, contenido público y equipos.</p>
            </div>
          </Link>
        ) : null}
      </div>

      <h2 className="mt-14 text-xl font-semibold">Próximamente</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {upcoming.map((u) => (
          <div key={u.title} className="rounded-xl border border-dashed border-border bg-card/50 p-5">
            <u.icon className="size-5 text-muted-foreground" aria-hidden />
            <p className="mt-3 font-semibold">{u.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{u.text}</p>
            <Badge variant="mono" className="mt-3">
              En construcción
            </Badge>
          </div>
        ))}
      </div>
    </section>
  );
}
