import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldError } from "@/components/site/auth-shell";
import { teamsQuery } from "@/lib/teams";
import { MAX_TEAM_MEMBERS, teamErrorMessage, teamInputSchema } from "@/lib/team-rules";

export const Route = createFileRoute("/_authenticated/equipos/")({
  head: () => ({ meta: [{ title: "Equipos · GUAPA" }, { name: "robots", content: "noindex" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(teamsQuery),
  component: EquiposPage,
});

function EquiposPage() {
  const { userId } = Route.useRouteContext();
  const { data: teams } = useSuspenseQuery(teamsQuery);
  // RLS only returns teams the user belongs to (admins see every team).
  const mine = teams.filter((t) => t.memberIds.includes(userId));

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">{"// equipos"}</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Equipos</h1>
          <p className="mt-2 text-muted-foreground">
            Hasta {MAX_TEAM_MEMBERS} integrantes por equipo. Puedes pertenecer a varios equipos.
          </p>
        </div>
        <CreateTeamDialog />
      </div>

      <h2 className="mt-12 text-xl font-semibold">Mis equipos ({mine.length})</h2>
      {mine.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          Aún no perteneces a ningún equipo. Crea uno para empezar.
        </p>
      ) : (
        <TeamGrid teams={mine} />
      )}
    </section>
  );
}

function TeamGrid({ teams }: { teams: { id: string; name: string; description: string | null; memberIds: string[] }[] }) {
  return (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((t) => {
        const full = t.memberIds.length >= MAX_TEAM_MEMBERS;
        return (
          <li key={t.id} className="min-w-0">
            <Link
              to="/equipos/$teamId"
              params={{ teamId: t.id }}
              className="card-interactive flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 truncate text-lg font-semibold">{t.name}</h3>
                <Badge variant={full ? "gold" : "mono"} className="shrink-0">
                  {t.memberIds.length}/{MAX_TEAM_MEMBERS}
                </Badge>
              </div>
              {t.description ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{t.description}</p>
              ) : null}
              <p className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs text-muted-foreground">
                <Users className="size-3.5" aria-hidden />
                {full ? "Equipo completo" : `${MAX_TEAM_MEMBERS - t.memberIds.length} lugares disponibles`}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

type TeamFormIn = z.input<typeof teamInputSchema>;
type TeamFormOut = z.output<typeof teamInputSchema>;

function CreateTeamDialog() {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { register, handleSubmit, formState, reset } = useForm<TeamFormIn, unknown, TeamFormOut>({
    resolver: zodResolver(teamInputSchema),
    defaultValues: { name: "", description: "" },
  });

  async function onSubmit(v: TeamFormOut) {
    setFormError(null);
    const { data, error } = await supabase
      .from("teams")
      .insert({ name: v.name, description: v.description })
      .select("id")
      .single();
    if (error) {
      setFormError(teamErrorMessage(error));
      return;
    }
    toast.success("Equipo creado");
    await qc.invalidateQueries({ queryKey: ["teams"] });
    setOpen(false);
    reset();
    navigate({ to: "/equipos/$teamId", params: { teamId: data.id } });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setFormError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="gold" className="w-full shrink-0 sm:w-auto">
          <Plus /> Crear equipo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear equipo</DialogTitle>
          <DialogDescription>Quedarás como primer integrante. Después podrás agregar a más miembros.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="t-name">Nombre del equipo</Label>
            <Input id="t-name" className="mt-1.5" {...register("name")} />
            <FieldError message={formState.errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="t-desc">Descripción (opcional)</Label>
            <Textarea id="t-desc" rows={3} className="mt-1.5" {...register("description")} />
            <FieldError message={formState.errors.description?.message} />
          </div>
          {formError ? (
            <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}
          <Button type="submit" variant="gold" className="w-full" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
            Crear equipo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
