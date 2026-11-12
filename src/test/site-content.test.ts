import { describe, expect, it } from "vitest";
import { sortActivitiesByDate, type Activity } from "@/content/site";

const a = (id: string, date: string): Activity => ({ id, date, title: id, tag: "x", description: "" });

describe("RF-004 actividades ordenadas por fecha", () => {
  it("muestra primero la actividad más reciente", () => {
    const sorted = sortActivitiesByDate([a("old", "2026-01-10"), a("new", "2026-11-01"), a("mid", "2026-06-15")]);
    expect(sorted.map((x) => x.id)).toEqual(["new", "mid", "old"]);
  });
});
