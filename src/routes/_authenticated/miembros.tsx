import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { membersQuery } from "@/lib/teams";

export const Route = createFileRoute("/_authenticated/miembros")({
  head: () => ({ meta: [{ title: "Miembros · GUAPA" }, { name: "robots", content: "noindex" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(membersQuery),
  component: MiembrosPage,
});

function MiembrosPage() {
  const { data: members } = useSuspenseQuery(membersQuery);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return members;
    return members.filter((m) => m.full_name.toLowerCase().includes(t) || m.username.toLowerCase().includes(t));
  }, [members, q]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">{"// miembros"}</p>
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Miembros de GUAPA</h1>
      <p className="mt-2 text-muted-foreground">{members.length} miembros activos.</p>

      <div className="relative mt-8 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o usuario" className="pl-9" aria-label="Buscar miembros" />
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <li key={m.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 font-display font-bold text-primary">
              {m.full_name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{m.full_name}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">@{m.username}</p>
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 ? <p className="mt-6 text-sm text-muted-foreground">Sin resultados.</p> : null}
    </section>
  );
}
