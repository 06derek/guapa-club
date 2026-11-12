# Plan: Plataforma Web GUAPA - FES Acatlán (MVP)

Basado en el SRS (RF-001 a RF-100, RD-001 a RD-004, AS-001 a AS-006). Se implementan los requisitos **Esenciales**; los **Condicionales** se proponen por etapas (ver pregunta Q1); los **Optativos** y RF-F01 a RF-F07 quedan fuera.

---

## 1. Análisis del SRS (resumen)

| Módulo | Requisitos | Prioridad dominante |
|---|---|---|
| Landing e info pública | RF-001 a RF-010 | Esencial (contacto, edición y borrado: Condicional) |
| Autenticación y acceso | RF-011 a RF-020 | Esencial (recuperación y cambio de contraseña: Condicional) |
| Usuarios y perfiles | RF-021 a RF-025 | Esencial (editar perfil y desactivar: Condicional) |
| Recursos | RF-026 a RF-032 | Esencial (categorías, búsqueda, editar, borrar: Condicional) |
| Equipos | RF-033 a RF-040 | Esencial |
| Codeforces y Scoreboard | RF-041 a RF-050 | Esencial |
| Competencias externas | RF-051 a RF-060 | Esencial (filtros, editar, borrar: Condicional) |
| Calendario | RF-061 a RF-066 | Esencial |
| Administración | RF-067 a RF-072 | Esencial |
| Seguridad e integridad | RF-073 a RF-078 | Esencial (auditoría: Condicional) |
| Estadísticas | RF-079 a RF-082 | Esencial (por periodo y de equipo: Condicional) |
| Interfaz | RF-083 a RF-090 | Esencial (modos claro/oscuro y temas de evento: Condicional) |
| Rendimiento y respaldo | RF-091 a RF-097 | Esencial, sin valores numéricos definidos |

---

## 2. Páginas y secciones

**Públicas (sin sesión)**
- `/` Landing: portada, qué es GUAPA, propósito, horarios, actividades recientes, próximas competencias, contacto (RF-001 a RF-005)
- `/actividades` listado por fecha (RF-004)
- `/recursos` y `/recursos/:id` solo recursos públicos (RF-026 a RF-029)
- `/calendario` (RF-061 a RF-066)
- `/login`, `/registro`, `/recuperar`, `/restablecer-contrasena` (RF-011 a RF-019)
- Página 404 propia (RF-010, RF-040, RF-065)

**Privadas (usuario registrado)**
- `/panel` resumen personal
- `/perfil` (propio, editable) y `/miembros`, `/miembros/:usuario` (RF-021 a RF-023)
- `/equipos`, `/equipos/:id` con estadísticas del equipo (RF-033 a RF-038, RF-082)
- `/scoreboard` con selector de periodo (RF-044 a RF-048)
- `/competencias` historial y registro manual con filtros (RF-051 a RF-060)
- `/estadisticas` personales e historial combinado (RF-079 a RF-081)
- `/configuracion` cuenta de Codeforces y cambio de contraseña (RF-015, RF-041)

**Administración**
- `/admin` resumen
- `/admin/usuarios` consulta, roles, desactivación (RF-024, RF-025, RF-068, RF-071)
- `/admin/equipos` (RF-039, RF-069)
- `/admin/recursos` y categorías (RF-030 a RF-032)
- `/admin/competencias` registros de todos y catálogo de plataformas (RF-052, RF-070)
- `/admin/contenido` información del club, horarios, actividades, contacto (RF-007 a RF-009)
- `/admin/auditoria` (RF-075) y `/admin/apariencia` tema de evento (RF-089), si se aprueban

---

## 3. Arquitectura propuesta

```text
Navegador (React 19 + TypeScript, TanStack Start/Router, Tailwind, componentes shadcn)
   |  lecturas con permisos (RLS)            |  operaciones sensibles
   v                                         v
Lovable Cloud: PostgreSQL + Auth + Storage   Funciones de servidor (createServerFn)
   ^  políticas RLS + has_role()              |-- Codeforces API (user.info, user.status)
   |                                          |-- Google Calendar (si se elige API)
   +---- tarea programada de sincronización (ruta protegida con secreto) ---+
```

- **Frontend:** rutas por archivo; grupos `_authenticated` (exige sesión) y `_authenticated/_admin` (exige rol admin). La UI oculta lo que no aplica, pero la autorización real ocurre en BD y servidor.
- **Backend:** Lovable Cloud (PostgreSQL gestionado, autenticación, almacenamiento de archivos, respaldos). Cubre lo que propones con Supabase sin cuentas externas.
- **Servidor:** las llamadas a Codeforces y Google se hacen desde funciones de servidor; cualquier clave queda como secreto del servidor, nunca en el navegador.
- **Validación:** esquemas Zod compartidos entre formulario y servidor (RF-073, RF-084), más restricciones en BD (RF-076).
- **Seguridad:** HTTPS por defecto, RLS en todas las tablas, roles en tabla separada, triggers para reglas de integridad (límite de 5).
- **Respaldo:** respaldos automáticos de la plataforma (RF-096); la frecuencia depende del plan (ver Q14).

---

## 4. Modelo de datos

```text
auth.users 1─1 profiles 1─N user_roles
profiles 1─0..1 codeforces_accounts 1─N cf_solved_problems
profiles N─M teams  (via team_members, máx. 5 por equipo, trigger)
profiles 1─N external_results N─1 external_platforms
resource_categories 1─N resources
activities, schedules, site_content, audit_log, site_settings
```

| Tabla | Campos principales |
|---|---|
| profiles | id (=auth user), full_name, username (único), avatar_url, bio, is_active, created_at |
| user_roles | user_id, role (`admin` / `user`), único (user_id, role) |
| teams | id, name (único), description, created_by, created_at |
| team_members | team_id, user_id, joined_at; PK compuesta; trigger rechaza el 6.º integrante |
| codeforces_accounts | user_id (PK), handle (único), rating, max_rating, rank, linked_at, last_synced_at, last_sync_status |
| cf_solved_problems | user_id, problem_key (contestId+índice), name, rating, tags, first_accepted_at; PK (user_id, problem_key) evita duplicados (RF-050) |
| external_platforms | id, name, url, is_active |
| external_results | id, user_id, platform_id, contest_name, contest_date, campos de resultado (ver Q8), notes |
| resource_categories | id, name, slug |
| resources | id, title, description, url o archivo, category_id, visibility (ver Q6), created_by, timestamps |
| activities | id, title, description, date, image_url, is_published |
| schedules | id, day_of_week, start_time, end_time, place, description |
| site_content | key, value (about, propósito, contacto, portada) |
| site_settings | active_event_theme (si se aprueba RF-089) |
| audit_log | actor_id, action, entity, entity_id, metadata, created_at (si se aprueba RF-075) |

Funciones auxiliares: `has_role(user, role)` (security definer), trigger de creación de perfil al registrarse, trigger de límite de integrantes, bloqueo de usuarios desactivados (RF-025).

---

## 5. Roles y permisos

| Acción | Visitante | Registrado | Admin |
|---|---|---|---|
| Ver landing, actividades, horarios, contacto, calendario | Sí | Sí | Sí |
| Ver recursos públicos | Sí | Sí | Sí |
| Ver recursos solo para miembros | No | Sí | Sí |
| Ver/editar su perfil, vincular Codeforces | No | Propio | Todos |
| Ver lista de miembros | Ver Q10 | Sí | Sí |
| Ver Scoreboard | Ver Q5 | Sí | Sí |
| Crear equipo / agregar integrantes | No | Ver Q2 | Sí |
| Abandonar equipo | No | Propio | Sí |
| Registrar/editar/borrar competencias externas | No | Propias | Todas (RF-070) |
| Ver estadísticas | No | Propias y de sus equipos (ver Q11) | Todas |
| Gestionar recursos, contenido, plataformas, equipos | No | No | Sí |
| Desactivar usuarios, cambiar roles | No | No | Sí |

Todo se aplica con políticas RLS y verificación en funciones de servidor (RF-016, RF-017, RF-020, RF-074).

---

## 6. Integraciones externas

1. **Codeforces API (pública, sin clave):** `user.info` para validar handle y obtener rating; `user.status` para envíos. Se guarda cada problema con veredicto `OK` una sola vez por usuario con su primera fecha de aceptación, lo que permite contar por periodo (RF-043, RF-044, RF-050). Límite de ~1 petición cada 2 s: sincronización en lotes y caché en BD; si falla se conserva el último dato y se muestra aviso (RF-049).
2. **Calendario de competencias:** opción A, widget embebido de Google Calendar (sin clave, simple); opción B, Google Calendar API con clave guardada en servidor y vista propia (ver Q7).
3. **Correo de autenticación** (confirmación y recuperación) mediante el servicio integrado de Lovable Cloud.

---

## 7. Contradicciones, ambigüedades y preguntas

**Contradicciones detectadas**
- C1. 1.2.1 punto 4 dice equipos "controlados por un administrador", pero RF-033 recibe "usuario creador" y 2.3.2 dice que el usuario "participa en equipos".
- C2. La definición de Scoreboard (1.3) ordena por problemas, tiempo y penalización (estilo ICPC), pero 1.2.1 punto 5 y RF-043 hablan solo de cantidad de problemas resueltos de Codeforces.
- C3. 2.3.1 menciona "recursos públicos", lo que implica recursos privados, pero RF-026 no define visibilidad.
- C4. 2.3.3 dice que los administradores gestionan "competencias"; no queda claro si son las del calendario o los registros externos de usuarios.
- C5. RF-062 y RF-065 piden ver una competencia del calendario por identificador, lo que no encaja con un simple widget embebido (1.2.1 punto 7).
- C6. RF-036 menciona una "restricción de pertenencia múltiple" que no se define en ningún lugar.
- C7. RD-001 a RD-004, RF-092 y RF-096 no tienen valores numéricos (tiempos, disponibilidad, frecuencia de respaldo).
- C8. Las referencias "sección 2.3.X" y "restricciones de auditoría, sección 2.4" no existen en el documento.

**Preguntas (necesito tu respuesta antes de las etapas afectadas)**
- Q1. ¿Se implementan todos los requisitos Condicionales en el MVP, o solo los Esenciales primero?
- Q2. Equipos: ¿quién crea equipos (solo admin o cualquier usuario)? ¿Quién agrega integrantes (admin, creador, invitación con aceptación)? ¿Existe un "capitán"? ¿Qué es la restricción de C6?
- Q3. Registro: ¿abierto a cualquiera, solo correos UNAM, o con aprobación de un admin? ¿Qué datos se piden (nombre, número de cuenta, carrera, semestre)? ¿Se exige confirmar el correo?
- Q4. Codeforces: ¿basta con que el handle exista, o se debe comprobar que es del usuario (por ejemplo, pidiendo un envío con error de compilación a un problema indicado)? ¿Un handle solo puede vincularse a una cuenta?
- Q5. Scoreboard: ¿criterio de orden y desempate (solo problemas únicos resueltos, o también rating)? ¿Periodo por defecto (semana, mes, semestre, todo)? ¿Es público o solo para miembros? ¿Cuentan problemas de Gym?
- Q6. Recursos: ¿enlaces externos únicamente o también archivos subidos (PDF)? ¿Cada recurso puede ser público o solo para miembros? ¿Lista fija de categorías?
- Q7. Calendario: ¿widget embebido de Google Calendar (A) o vista propia con la API de Google (B)? ¿Ya existe un calendario público de GUAPA?
- Q8. Resultado de competencia externa: ¿qué campos (lugar, puntaje, problemas resueltos, total de participantes, texto libre)? ¿Puede registrarse como equipo? ¿Catálogo fijo de plataformas o admin lo gestiona?
- Q9. Recuperación de cuenta: ¿por correo electrónico es suficiente?
- Q10. Miembros: ¿la lista y perfiles son visibles para visitantes o solo para usuarios registrados? ¿Qué campos del perfil son públicos?
- Q11. Estadísticas de equipo: ¿suma de problemas de los integrantes o problemas distintos resueltos por el equipo? ¿Quién puede verlas?
- Q12. Permisos (RF-071): ¿bastan dos roles (usuario y admin) o se necesitan permisos más finos? ¿Quién será el primer administrador (correo)?
- Q13. Sincronización con Codeforces: ¿bajo demanda (botón), programada (cada X horas) o ambas?
- Q14. ¿Valores para RD-001 a RD-004 y frecuencia de respaldo, o usamos ~100 usuarios/día y respaldo diario de la plataforma?
- Q15. Temas de evento (RF-089) y auditoría (RF-075): ¿se incluyen? Si sí, ¿qué eventos?
- Q16. Contenido: ¿tienes logotipo de GUAPA, textos, horarios y contactos reales? Si no, usaré textos de ejemplo marcados para reemplazo.
- Q17. Fecha: el SRS indica entrega final del 14 al 20 de noviembre. ¿Ajustamos prioridades a esa fecha?

---

## 8. Etapas de desarrollo

| Etapa | Contenido | Depende de | Bloqueada por |
|---|---|---|---|
| 0 | Sistema de diseño (claro/oscuro), layout, navegación responsive, 404, landing con contenido de ejemplo | Nada | Q16 (opcional) |
| 1 | Lovable Cloud, registro, login, logout, recuperación, cambio de contraseña, perfiles, roles, guardias de rutas | 0 | Q3, Q9, Q12 |
| 2 | Panel de admin base y gestión de contenido público (info, horarios, actividades, contacto) | 1 | - |
| 3 | Repositorio de recursos (listado, detalle, categorías, búsqueda, CRUD admin) | 1, 2 | Q6 |
| 4 | Miembros y equipos (límite de 5, multi-equipo, abandono, admin) | 1 | Q2, Q10 |
| 5 | Vinculación y sincronización con Codeforces | 1 | Q4, Q13 |
| 6 | Scoreboard con selector de periodo | 5 | Q5 |
| 7 | Competencias externas (registro, historial, filtros, catálogo de plataformas) | 1 | Q8 |
| 8 | Estadísticas personales, historial combinado, estadísticas de equipo | 4, 5, 7 | Q11 |
| 9 | Calendario público | 0 | Q7 |
| 10 | Admin avanzado: usuarios, desactivación, roles, auditoría, competencias de todos | 2, 4, 7 | Q12, Q15 |
| 11 | Tema de evento, pulido visual, pruebas de reglas, escaneo de seguridad | Todas | Q15 |

**Pueden empezar ya:** etapa 0 y etapa 9 (si es widget). **Ruta crítica:** 1 → 5 → 6 → 8. Las etapas 3, 4 y 7 son independientes entre sí tras la 1.

---

## 9. Dirección visual propuesta

- Identidad: azul profundo UNAM con acento dorado, más un verde "Accepted" para métricas y logros; evitar el morado.
- Tipografía: Space Grotesk para títulos, IBM Plex Sans para texto, JetBrains Mono para datos, handles y números del Scoreboard.
- Motivos: cuadrícula sutil tipo editor de código, tarjetas con borde fino y brillo al pasar el cursor, contadores animados, transiciones suaves entre secciones.
- Modo claro y oscuro con selector y preferencia guardada.

---

## Detalles técnicos

- TanStack Start v1 (stack fijo del proyecto) cumple React + TypeScript; Vite 7, Tailwind v4 con tokens oklch en `src/styles.css`.
- Datos con TanStack Query: loader `ensureQueryData` + `useSuspenseQuery`.
- Funciones de servidor con middleware de autenticación; acciones de admin verifican `has_role` antes de usar el cliente privilegiado.
- Migraciones con `GRANT` explícitos, RLS y políticas por tabla; roles en `user_roles`, nunca en `profiles`.
- Sincronización programada mediante ruta `/api/public/cron/codeforces` protegida con un secreto compartido.
- Pruebas con Vitest para reglas clave: límite de 5 integrantes, deduplicación de problemas, validación de periodo (fecha inicial no posterior a la final), validación de fechas, permisos de admin.
