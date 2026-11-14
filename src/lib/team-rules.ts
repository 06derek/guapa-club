import { z } from "zod";

/** RF-035: un equipo admite como máximo 5 integrantes (la base de datos también lo impone). */
export const MAX_TEAM_MEMBERS = 5;

export const teamInputSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(60, "Máximo 60 caracteres"),
  description: z
    .string()
    .trim()
    .max(300, "Máximo 300 caracteres")
    .optional()
    .transform((v) => (v ? v : null)),
});
export type TeamInput = z.infer<typeof teamInputSchema>;

export function canAddMember(currentCount: number): boolean {
  return currentCount < MAX_TEAM_MEMBERS;
}

/** Traduce los errores de la base de datos a mensajes para el usuario. */
export function teamErrorMessage(error: unknown): string {
  const e = (error ?? {}) as { message?: string; code?: string };
  const msg = e.message ?? "";
  if (msg.includes("TEAM_FULL")) return `El equipo ya tiene ${MAX_TEAM_MEMBERS} integrantes.`;
  if (msg.includes("USER_NOT_ELIGIBLE")) return "Ese usuario no puede incorporarse a equipos.";
  if (msg.includes("TEAM_NOT_FOUND")) return "El equipo no existe.";
  if (e.code === "23505") {
    return msg.includes("team_members") || msg.includes("pkey")
      ? "Ese usuario ya pertenece al equipo."
      : "Ya existe un equipo con ese nombre.";
  }
  if (e.code === "42501") return "No tienes permiso para hacer esto.";
  return "No se pudo completar la operación.";
}
