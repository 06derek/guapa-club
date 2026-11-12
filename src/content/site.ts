/**
 * Contenido público de GUAPA.
 * IMPORTANTE: los horarios, actividades y contactos son DATOS DE EJEMPLO
 * hasta que el cliente proporcione los reales (y luego se gestionarán desde el panel de administración).
 */

export const SAMPLE_CONTENT = true;

export const club = {
  name: "GUAPA",
  fullName: "Grupo Universitario de Algoritmia y Programación Avanzada",
  institution: "FES Acatlán · UNAM",
  parent: "CEDETEC",
  purpose:
    "Formar a estudiantes de la FES Acatlán en algoritmia y programación competitiva, preparándolos para concursos como el ICPC y fortaleciendo una comunidad que aprende, compite y crece en equipo.",
};

export const pillars = [
  {
    key: "comunidad",
    title: "Comunidad",
    text: "Estudiantes de distintas carreras que comparten problemas, ideas y soluciones.",
  },
  {
    key: "competencia",
    title: "Competencia",
    text: "Entrenamiento constante en Codeforces y otros jueces para representar a la FES.",
  },
  {
    key: "aprendizaje",
    title: "Aprendizaje",
    text: "Guías y recursos centralizados, desde estructuras de datos hasta grafos y DP.",
  },
  {
    key: "tecnologia",
    title: "Tecnología",
    text: "Herramientas para medir el progreso individual y por equipos con datos reales.",
  },
] as const;

export type Schedule = {
  day: string;
  start: string;
  end: string;
  place: string;
  activity: string;
};

export const schedules: Schedule[] = [
  { day: "Lunes", start: "14:00", end: "16:00", place: "CEDETEC · Sala 1", activity: "Sesión de teoría" },
  { day: "Miércoles", start: "14:00", end: "16:00", place: "CEDETEC · Sala 1", activity: "Práctica guiada" },
  { day: "Viernes", start: "12:00", end: "15:00", place: "CEDETEC · Laboratorio", activity: "Simulacro de concurso" },
];

export type Activity = {
  id: string;
  title: string;
  date: string; // ISO
  tag: string;
  description: string;
};

export const activities: Activity[] = [
  {
    id: "simulacro-icpc",
    title: "Simulacro estilo ICPC",
    date: "2026-11-07",
    tag: "Concurso",
    description: "Cinco horas, tres integrantes por equipo y un solo teclado. Repaso de estrategias de equipo.",
  },
  {
    id: "taller-grafos",
    title: "Taller: grafos y caminos mínimos",
    date: "2026-10-29",
    tag: "Taller",
    description: "BFS, Dijkstra y Bellman-Ford con problemas seleccionados de Codeforces.",
  },
  {
    id: "bienvenida",
    title: "Sesión de bienvenida",
    date: "2026-10-15",
    tag: "Comunidad",
    description: "Presentación del grupo, dinámica de entrenamiento y primeros pasos en Codeforces.",
  },
  {
    id: "dp-intro",
    title: "Introducción a programación dinámica",
    date: "2026-10-08",
    tag: "Taller",
    description: "Estados, transiciones y memoización a partir de problemas clásicos.",
  },
];

export const contact = {
  email: "guapa.acatlan@ejemplo.mx",
  location: "CEDETEC, FES Acatlán, Naucalpan, Estado de México",
  socials: [
    { label: "Facebook", href: "https://facebook.com" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Discord", href: "https://discord.com" },
  ],
};

export function sortActivitiesByDate(list: Activity[]): Activity[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

export function formatDate(iso: string): string {
  const [y = 1970, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
