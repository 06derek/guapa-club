import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2, UserMinus, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { myRolesQuery } from "@/lib/auth";
import { formatDate } from "@/content/site";
import { isUuid, membersQuery, teamDetailQuery } from "@/lib/teams";
import { canAddMember, MAX_TEAM_MEMBERS, teamErrorMessage } from "@/lib/team-rules";

export const Route = createFileRoute("/_authenticated/equipos/$teamId")({
  head: () => ({ meta: [{ title: "Equipo · GUAPA" }, { name: "robots", content: "noindex" }] }),
  loader: async ({ context, params }) => {
    if (!isUuid(params.teamId)) throw notFound();
    const team = await context.queryClient.ensureQueryData(teamDetailQuery(params.teamId));
    if (!team) throw notFound();
    await context.queryClient.ensureQueryData(myRolesQuery(context.userId));
  },
  notFoundComponent: TeamNotFound,
  component: TeamPage,
});

function TeamNotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">{"// 404"}</p>
      <h1 className="mt-3 text-3xl font-bold">Equipo no encontrado</h1>
      <p className="mt-2 text-muted-foreground">El equipo que buscas no existe o fue eliminado.</p>
      <Button asChild variant="glass" className="mt-6">
        <Link to="/equipos">
          <ArrowLeft /> Volver a equipos
        </Link>
      </Button>
    </section>
  );
}

function TeamPage() {
  const { teamId } = Route.useParams();
  const { userId } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: team } = useSuspenseQuery(teamDetailQuery(teamId));
  const { data: roles } = useSuspenseQuery(myRolesQuery(userId));
  const isAdmin = roles.includes("admin");

  if (!team) return <TeamNotFound />;

  const isMember = team.members.some((m) => m.id === userId);
  const canManage = isMember || isAdmin;
  const hasRoom = canAddMember(team.members.length);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["teams"] });
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link to="/equipos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Equipos
      </Link>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">{"// equipo"}</p>
          <h1 className="mt-3 break-words text-3xl font-bold sm:text-4xl">{team.name}</h1>
          {team.description ? <p className="mt-2 text-muted-foreground">{team.description}</p> : null}
          <p className="mt-2 font-mono text-xs text-muted-foreground">Creado el {formatDate(team.created_at.slice(0, 10))}</p>
        </div>
        <Badge variant={hasRoom ? "mono" : "gold"} className="w-fit shrink-0 text-sm">
          {team.members.length}/{MAX_TEAM_MEMBERS} integrantes
        </Badge>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Integrantes</h2>
      <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {team.members.map((m) => (
          <MemberRow key={m.id} member={m} teamId={team.id} isSelf={m.id === userId} canRemove={isAdmin} onChanged={refresh} />
        ))}
      </ul>

      {canManage ? (
        hasRoom ? (
          <AddMember teamId={team.id} currentIds={team.members.map((m) => m.id)} onAdded={refresh} />
        ) : (
          <p className="mt-6 rounded-xl border border-dashed border-gold/40 bg-gold/5 p-4 text-sm text-gold">
            El equipo está completo ({MAX_TEAM_MEMBERS} integrantes).
          </p>
        )
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">Solo los integrantes del equipo pueden agregar miembros.</p>
      )}
    </section>
  );
}

function MemberRow({
  member,
  teamId,
  isSelf,
  canRemove,
  onChanged,
}: {
  member: { id: string; full_name: string; username: string; joined_at: string };
  teamId: string;
  isSelf: boolean;
  canRemove: boolean;
  onChanged: () => void;
}) {
  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("team_members").delete().eq("team_id", teamId).eq("user_id", member.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Integrante retirado");
      onChanged();
    },
    onError: (e) => toast.error(teamErrorMessage(e)),
  });

  return (
    <li className="flex items-center justify-between gap-3 px-5 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 font-display font-bold text-primary">
          {member.full_name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">
            {member.full_name} {isSelf ? <span className="text-xs text-gold">(tú)</span> : null}
          </p>
          <p className="truncate font-mono text-xs text-muted-foreground">@{member.username}</p>
        </div>
      </div>
      {canRemove ? (
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0 text-destructive"
          disabled={remove.isPending}
          onClick={() => remove.mutate()}
          aria-label={`Retirar a ${member.full_name}`}
        >
          <UserMinus />
          <span className="hidden sm:inline">Retirar</span>
        </Button>
      ) : null}
    </li>
  );
}

function AddMember({ teamId, currentIds, onAdded }: { teamId: string; currentIds: string[]; onAdded: () => void }) {
  const { userId } = Route.useRouteContext();
  const { data: members = [], isLoading } = useQuery(membersQuery);
  const [selected, setSelected] = useState("");
  const candidates = useMemo(() => members.filter((m) => !currentIds.includes(m.id)), [members, currentIds]);

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("team_members").insert({ team_id: teamId, user_id: selected, added_by: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Integrante agregado");
      setSelected("");
      onAdded();
    },
    onError: (e) => toast.error(teamErrorMessage(e)),
  });

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="flex items-center gap-2 font-semibold">
        <UserPlus className="size-4 text-gold" aria-hidden /> Agregar integrante
      </h3>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          aria-label="Miembro a agregar"
          disabled={isLoading || candidates.length === 0}
          className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">{candidates.length === 0 && !isLoading ? "No hay más miembros disponibles" : "Elige un miembro…"}</option>
          {candidates.map((m) => (
            <option key={m.id} value={m.id} className="bg-popover text-popover-foreground">
              {m.full_name} (@{m.username})
            </option>
          ))}
        </select>
        <Button variant="gold" disabled={!selected || add.isPending} onClick={() => add.mutate()}>
          {add.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
          Agregar
        </Button>
      </div>
    </div>
  );
}
