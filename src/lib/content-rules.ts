import { z } from "zod";

export const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;

export function dayName(dayOfWeek: number): string {
  return DAYS[dayOfWeek - 1] ?? "—";
}

const text = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label}: mínimo ${min} caracteres`)
    .max(max, `${label}: máximo ${max} caracteres`);

export const activityInputSchema = z.object({
  title: text(3, 120, "Título"),
  tag: text(2, 40, "Etiqueta"),
  description: text(3, 1000, "Descripción"),
  activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
});
export type ActivityInput = z.infer<typeof activityInputSchema>;

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida (HH:MM)");

export const scheduleInputSchema = z
  .object({
    dayOfWeek: z.string().regex(/^[1-7]$/, "Elige un día").transform(Number),
    startTime: time,
    endTime: time,
    activity: text(3, 120, "Actividad"),
    place: text(2, 120, "Lugar"),
  })
  .refine((v) => v.endTime > v.startTime, {
    message: "La hora de fin debe ser posterior a la de inicio",
    path: ["endTime"],
  });
export type ScheduleInput = z.infer<typeof scheduleInputSchema>;
