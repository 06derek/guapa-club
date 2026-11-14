import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { activities as sampleActivities, schedules as sampleSchedules, sortActivitiesByDate, type Activity, type Schedule } from "@/content/site";
import { dayName } from "@/lib/content-rules";

/**
 * Contenido público registrado por administradores (RF-003, RF-004, RF-007).
 * Mientras no haya registros reales, se muestran los datos de ejemplo marcados como tales.
 */
export const activitiesQuery = queryOptions({
  queryKey: ["public", "activities"],
  queryFn: async (): Promise<{ items: Activity[]; isSample: boolean }> => {
    const { data, error } = await supabase
      .from("activities")
      .select("id, title, description, tag, activity_date")
      .order("activity_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (data.length === 0) return { items: sortActivitiesByDate(sampleActivities), isSample: true };
    return {
      items: data.map((a) => ({ id: a.id, title: a.title, description: a.description, tag: a.tag, date: a.activity_date })),
      isSample: false,
    };
  },
});

export const schedulesQuery = queryOptions({
  queryKey: ["public", "schedules"],
  queryFn: async (): Promise<{ items: Schedule[]; isSample: boolean }> => {
    const { data, error } = await supabase
      .from("schedules")
      .select("id, day_of_week, start_time, end_time, activity, place")
      .order("day_of_week")
      .order("start_time");
    if (error) throw error;
    if (data.length === 0) return { items: sampleSchedules, isSample: true };
    return {
      items: data.map((s) => ({
        day: dayName(s.day_of_week),
        start: s.start_time.slice(0, 5),
        end: s.end_time.slice(0, 5),
        activity: s.activity,
        place: s.place,
      })),
      isSample: false,
    };
  },
});
