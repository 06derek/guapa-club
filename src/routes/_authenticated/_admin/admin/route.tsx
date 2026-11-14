import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { FileText, Swords, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin")({
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Usuarios", icon: Users, exact: true },
  { to: "/admin/contenido", label: "Contenido", icon: FileText, exact: false },
  { to: "/admin/equipos", label: "Equipos", icon: Swords, exact: false },
] as const;

function AdminLayout() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">{"// administración"}</p>
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Panel de administración</h1>
      <nav
        aria-label="Secciones de administración"
        className="mt-6 flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1"
      >
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeOptions={{ exact: t.exact }}
            className="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-card data-[status=active]:text-foreground data-[status=active]:shadow-card"
          >
            <t.icon className="size-4" aria-hidden />
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">
        <Outlet />
      </div>
    </section>
  );
}
