import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { teamsQuery } from "@/lib/teams";
import { MAX_TEAM_MEMBERS, teamErrorMessage, teamInputSchema } from "@/lib/team-rules";

export const Route = createFileRoute("/_authenticated/_admin/admin/equipos")({
  head: () => ({ meta: [{ title: "Equipos · Administración GUAPA" }, { name: "robots", content: "noindex" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(teamsQuery),
  component: AdminTeamsPage,
});

function AdminTeamsPage() {
  const { data: teams } = useSuspenseQuery(teamsQuery);
  return (
    <>
      <h2 className="text-2xl font-bold">Equipos</h2>
      <p className="mt-1 text-muted-foreground">
        {teams.length} equipos. Como administrador puedes renombrarlos, eliminarlos y retirar integrantes desde el
        detalle de cada equipo.
      </p>
      {teams.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Todavía no hay equipos.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card">
          {teams.map((t) => (
            <TeamRow key={t.id} team={t} />
          ))}
        </ul>
      )}
    </>
  );
}

function TeamRow({ team }: { team: { id: string; name: string; memberIds: string[] } }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(team.name);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["teams"] });

  const rename = useMutation({
    mutationFn: async () => {
      const parsed = teamInputSchema.shape.name.safeParse(name);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Nombre inválido");
      const { error } = await supabase.from("teams").update({ name: parsed.data }).eq("id", team.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Equipo actualizado");
      setEditing(false);
      setError(null);
      refresh();
    },
    onError: (e) => setError(e instanceof Error && !("code" in e) ? e.message : teamErrorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("teams").delete().eq("id", team.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Equipo eliminado");
      refresh();
    },
    onError: (e) => toast.error(teamErrorMessage(e)),
  });

  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      {editing ? (
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="Nuevo nombre" className="max-w-sm" />
            <Button size="icon" variant="gold" aria-label="Guardar" disabled={rename.isPending} onClick={() => rename.mutate()}>
              <Check />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Cancelar"
              onClick={() => {
                setEditing(false);
                setName(team.name);
                setError(null);
              }}
            >
              <X />
            </Button>
          </div>
          {error ? <p className="mt-1.5 text-xs text-destructive">{error}</p> : null}
        </div>
      ) : (
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/equipos/$teamId"
            params={{ teamId: team.id }}
            className="truncate font-medium hover:text-gold"
          >
            {team.name}
          </Link>
          <Badge variant={team.memberIds.length >= MAX_TEAM_MEMBERS ? "gold" : "mono"} className="shrink-0">
            {team.memberIds.length}/{MAX_TEAM_MEMBERS}
          </Badge>
        </div>
      )}
      {!editing ? (
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="glass" onClick={() => setEditing(true)}>
            <Pencil /> Renombrar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-destructive">
                <Trash2 /> Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar «{team.name}»?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminará el equipo y la lista de sus integrantes. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => remove.mutate()}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : null}
    </li>
  );
}
