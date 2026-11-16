import { describe, expect, it } from "vitest";
import { activityInputSchema, dayName, scheduleInputSchema } from "@/lib/content-rules";
import { canAddMember, MAX_TEAM_MEMBERS, teamErrorMessage, teamInputSchema } from "@/lib/team-rules";

describe("Equipos: límite de integrantes (RF-035)", () => {
  it("el máximo es 5", () => {
    expect(MAX_TEAM_MEMBERS).toBe(5);
  });
  it("permite agregar con 4 integrantes y rechaza con 5", () => {
    expect(canAddMember(4)).toBe(true);
    expect(canAddMember(5)).toBe(false);
  });
  it("traduce el rechazo de la base de datos por equipo lleno", () => {
    expect(teamErrorMessage({ message: "TEAM_FULL", code: "P0001" })).toBe("El equipo ya tiene 5 integrantes.");
  });
});

describe("Equipos: nombre", () => {
  it("exige al menos 2 caracteres", () => {
    expect(teamInputSchema.safeParse({ name: " A " }).success).toBe(false);
    expect(teamInputSchema.safeParse({ name: "Los Grafos" }).success).toBe(true);
  });
});

describe("Horarios", () => {
  const base = { dayOfWeek: "3", startTime: "14:00", endTime: "16:00", activity: "Práctica", place: "Sala 1" };
  it("rechaza una hora de fin anterior o igual a la de inicio", () => {
    expect(scheduleInputSchema.safeParse(base).success).toBe(true);
    expect(scheduleInputSchema.safeParse({ ...base, endTime: "13:00" }).success).toBe(false);
    expect(scheduleInputSchema.safeParse({ ...base, endTime: "14:00" }).success).toBe(false);
  });
  it("exige elegir un día", () => {
    expect(scheduleInputSchema.safeParse({ ...base, dayOfWeek: "" }).success).toBe(false);
    expect(dayName(3)).toBe("Miércoles");
  });
});

describe("Actividades", () => {
  it("exige fecha válida", () => {
    const a = { title: "Taller de DP", tag: "Taller", description: "Problemas clásicos", activityDate: "2026-11-20" };
    expect(activityInputSchema.safeParse(a).success).toBe(true);
    expect(activityInputSchema.safeParse({ ...a, activityDate: "20/11/2026" }).success).toBe(false);
  });
});
