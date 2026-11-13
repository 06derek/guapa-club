import { z } from "zod";

/** Mirrors public.is_unam_email in the database (the database is the real gatekeeper). */
export function isUnamEmail(email: string): boolean {
  return /^[^@\s]+@([a-z0-9-]+\.)*unam\.mx$/.test(email.trim().toLowerCase());
}

export const USERNAME_REGEX = /^[A-Za-z0-9_]{3,24}$/;

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Escribe tu correo").email("Correo inválido").max(255),
  password: z.string().min(1, "Escribe tu contraseña").max(128),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(100, "Máximo 100 caracteres"),
    username: z
      .string()
      .trim()
      .regex(USERNAME_REGEX, "3 a 24 caracteres: letras, números o guion bajo"),
    email: z
      .string()
      .trim()
      .min(1, "Escribe tu correo")
      .email("Correo inválido")
      .max(255)
      .refine(isUnamEmail, "Usa tu correo institucional de la UNAM (termina en unam.mx)"),
    password: z.string().min(8, "Mínimo 8 caracteres").max(128),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden" });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export function authErrorMessage(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("correos institucionales") || m.includes("inválido")) return message ?? "";
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "Confirma tu correo antes de iniciar sesión.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Ya existe una cuenta con ese correo.";
  if (m.includes("database error")) return "No se pudo crear la cuenta. Revisa que tu correo sea UNAM y tu usuario sea válido.";
  if (m.includes("rate limit")) return "Demasiados intentos. Espera unos minutos.";
  if (m.includes("password")) return "La contraseña no cumple los requisitos de seguridad.";
  return "No se pudo completar la operación. Intenta de nuevo.";
}

/** Only allow same-origin relative redirects. */
export function safeRedirect(value: unknown, fallback = "/panel"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
