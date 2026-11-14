import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { CalendarPlus, Clock, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/site/auth-shell";
import { formatDate } from "@/content/site";
import { activityInputSchema, DAYS, dayName, scheduleInputSchema, type ActivityInput } from "@/lib/content-rules";

const adminContentQuery = queryOptions({
  queryKey: ["admin", "content"],
  queryFn: async () => {
    const [a, s] = await Promise.all([
      supabase
        .from("activities")
        .select("id, title, tag, activity_date")
        .order("activity_date", { ascending: false }),
      supabase.from("schedules").select("id, day_of_week, start_time, end_time, activity, place").order("day_of_week").order("start_time"),
    ]);
    if (a.error) throw a.error;
    if (s.error) throw s.error;
    return { activities: a.data, schedules: s.data };
  },
});

export const Route = createFileRoute("/_authenticated/_admin/admin/contenido")({
  head: () => ({ meta: [{ title: "Contenido público · Administración GUAPA" }, { name: "robots", content: "noindex" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminContentQuery),
  component: ContenidoPage,
});

function useRefreshContent() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["admin", "content"] });
    qc.invalidateQueries({ queryKey: ["public"] });
  };
}

function ContenidoPage() {
  const { data } = useSuspenseQuery(adminContentQuery);
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold">Contenido público</h2>
        <p className="mt-1 text-muted-foreground">
          Lo que registres aquí aparece de inmediato en la página principal, Actividades y Horarios. Mientras no haya
          registros, el sitio muestra los datos de ejemplo.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ActivityForm />
        <div className="min-w-0">
          <h3 className="font-semibold">Actividades registradas ({data.activities.length})</h3>
          {data.activities.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Aún no hay actividades registradas.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
              {data.activities.map((a) => (
                <li key={a.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="min-w-0 truncate font-medium">{a.title}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {a.tag} · {formatDate(a.activity_date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-8 border-t border-border pt-12 lg:grid-cols-2">
        <ScheduleForm />
        <div className="min-w-0">
          <h3 className="font-semibold">Horarios registrados ({data.schedules.length})</h3>
          {data.schedules.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Aún no hay horarios registrados.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
              {data.schedules.map((s) => (
                <li key={s.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="min-w-0 truncate font-medium">
                    {dayName(s.day_of_week)} · {s.activity}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)} · {s.place}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function FormCard({ title, icon: Icon, children }: { title: string; icon: typeof Plus; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-5 shadow-card sm:p-6">
      <h3 className="flex items-center gap-2 font-semibold">
        <Icon className="size-4 text-gold" aria-hidden /> {title}
      </h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function ActivityForm() {
  const refresh = useRefreshContent();
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState, reset } = useForm<ActivityInput>({
    resolver: zodResolver(activityInputSchema),
    defaultValues: { title: "", tag: "", description: "", activityDate: "" },
  });

  async function onSubmit(v: ActivityInput) {
    setFormError(null);
    const { error } = await supabase
      .from("activities")
      .insert({ title: v.title, tag: v.tag, description: v.description, activity_date: v.activityDate });
    if (error) {
      setFormError(error.code === "42501" ? "No tienes permiso para registrar contenido." : "No se pudo guardar la actividad.");
      return;
    }
    toast.success("Actividad publicada");
    reset();
    refresh();
  }

  return (
    <FormCard title="Registrar actividad" icon={CalendarPlus}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="a-title">Título</Label>
          <Input id="a-title" className="mt-1.5" {...register("title")} />
          <FieldError message={formState.errors.title?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="a-tag">Etiqueta</Label>
            <Input id="a-tag" placeholder="Taller, Concurso…" className="mt-1.5" {...register("tag")} />
            <FieldError message={formState.errors.tag?.message} />
          </div>
          <div>
            <Label htmlFor="a-date">Fecha</Label>
            <Input id="a-date" type="date" className="mt-1.5" {...register("activityDate")} />
            <FieldError message={formState.errors.activityDate?.message} />
          </div>
        </div>
        <div>
          <Label htmlFor="a-desc">Descripción</Label>
          <Textarea id="a-desc" rows={3} className="mt-1.5" {...register("description")} />
          <FieldError message={formState.errors.description?.message} />
        </div>
        {formError ? <FormAlert>{formError}</FormAlert> : null}
        <Button type="submit" variant="gold" className="w-full sm:w-auto" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Plus />}
          Publicar actividad
        </Button>
      </form>
    </FormCard>
  );
}

type ScheduleFormIn = z.input<typeof scheduleInputSchema>;
type ScheduleFormOut = z.output<typeof scheduleInputSchema>;

function ScheduleForm() {
  const refresh = useRefreshContent();
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState, reset } = useForm<ScheduleFormIn, unknown, ScheduleFormOut>({
    resolver: zodResolver(scheduleInputSchema),
    defaultValues: { dayOfWeek: "", startTime: "", endTime: "", activity: "", place: "" },
  });

  async function onSubmit(v: ScheduleFormOut) {
    setFormError(null);
    const { error } = await supabase.from("schedules").insert({
      day_of_week: v.dayOfWeek,
      start_time: v.startTime,
      end_time: v.endTime,
      activity: v.activity,
      place: v.place,
    });
    if (error) {
      setFormError(error.code === "42501" ? "No tienes permiso para registrar contenido." : "No se pudo guardar el horario.");
      return;
    }
    toast.success("Horario publicado");
    reset();
    refresh();
  }

  return (
    <FormCard title="Registrar horario" icon={Clock}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="s-day">Día</Label>
            <select
              id="s-day"
              className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("dayOfWeek")}
            >
              <option value="">Elige…</option>
              {DAYS.map((d, i) => (
                <option key={d} value={i + 1} className="bg-popover text-popover-foreground">
                  {d}
                </option>
              ))}
            </select>
            <FieldError message={formState.errors.dayOfWeek?.message} />
          </div>
          <div>
            <Label htmlFor="s-start">Inicio</Label>
            <Input id="s-start" type="time" className="mt-1.5" {...register("startTime")} />
            <FieldError message={formState.errors.startTime?.message} />
          </div>
          <div>
            <Label htmlFor="s-end">Fin</Label>
            <Input id="s-end" type="time" className="mt-1.5" {...register("endTime")} />
            <FieldError message={formState.errors.endTime?.message} />
          </div>
        </div>
        <div>
          <Label htmlFor="s-act">Actividad</Label>
          <Input id="s-act" placeholder="Práctica guiada" className="mt-1.5" {...register("activity")} />
          <FieldError message={formState.errors.activity?.message} />
        </div>
        <div>
          <Label htmlFor="s-place">Lugar</Label>
          <Input id="s-place" placeholder="Edificio, salón…" className="mt-1.5" {...register("place")} />
          <FieldError message={formState.errors.place?.message} />
        </div>
        {formError ? <FormAlert>{formError}</FormAlert> : null}
        <Button type="submit" variant="gold" className="w-full sm:w-auto" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Plus />}
          Publicar horario
        </Button>
      </form>
    </FormCard>
  );
}

function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {children}
    </p>
  );
}
