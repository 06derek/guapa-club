import { describe, expect, it } from "vitest";
import { isUnamEmail, registerSchema, safeRedirect } from "@/lib/auth-rules";

describe("Registro solo con correos UNAM", () => {
  it("acepta correos de dominio unam.mx y sus subdominios", () => {
    expect(isUnamEmail("ana@unam.mx")).toBe(true);
    expect(isUnamEmail("ana@pcpuma.acatlan.unam.mx")).toBe(true);
    expect(isUnamEmail("Ana@Comunidad.UNAM.mx")).toBe(true);
  });
  it("rechaza correos fuera de la UNAM o que solo imitan el dominio", () => {
    expect(isUnamEmail("ana@gmail.com")).toBe(false);
    expect(isUnamEmail("ana@unam.mx.evil.com")).toBe(false);
    expect(isUnamEmail("ana@fakeunam.mx")).toBe(false);
  });
});

describe("Datos de registro", () => {
  const base = { fullName: "Ana López", username: "ana_lopez", email: "ana@unam.mx", password: "secreto123", confirm: "secreto123" };
  it("exige nombre completo y nombre de usuario válidos", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, fullName: "" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, username: "a b" }).success).toBe(false);
  });
  it("rechaza contraseñas distintas", () => {
    expect(registerSchema.safeParse({ ...base, confirm: "otra12345" }).success).toBe(false);
  });
});

describe("Redirección segura tras iniciar sesión", () => {
  it("solo permite rutas internas", () => {
    expect(safeRedirect("/perfil")).toBe("/perfil");
    expect(safeRedirect("//evil.com")).toBe("/panel");
    expect(safeRedirect("https://evil.com")).toBe("/panel");
  });
});
