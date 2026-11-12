# Guapa Club

# Proyecto: Plataforma Web GUAPA - FES Acatlán

Quiero desarrollar una plataforma web completa para el Grupo Universitario de Algoritmia y Programación Avanzada (GUAPA), perteneciente a la FES Acatlán de la UNAM.

He adjuntado un documento de especificación de requerimientos de software (SRS). Este documento debe ser la principal fuente de información para el desarrollo del proyecto.

## 1. Objetivo

Desarrollar una plataforma web que centralice la información, los recursos de aprendizaje, los miembros, los equipos y las estadísticas competitivas de GUAPA.

La aplicación tendrá una sección pública y otra privada para usuarios registrados.

## 2. Tipos de usuario

El sistema deberá contemplar tres roles:

- Visitante: puede consultar la información pública.
- Usuario registrado: puede gestionar su perfil, consultar estadísticas, participar en equipos y utilizar las herramientas disponibles para miembros.
- Administrador: puede gestionar usuarios, equipos, recursos, competencias y contenido público.

Los permisos deberán implementarse correctamente, no solamente ocultando botones en la interfaz.

## 3. Módulos principales

La plataforma deberá contemplar los siguientes módulos:

1. Landing Page e información general de GUAPA.
2. Registro, inicio y cierre de sesión.
3. Perfiles de usuarios.
4. Gestión de equipos con un máximo de cinco integrantes.
5. Repositorio de recursos de aprendizaje.
6. Integración con la API de Codeforces.
7. Scoreboard de miembros.
8. Registro manual de competencias externas.
9. Estadísticas personales y de equipos.
10. Calendario público de competencias.
11. Panel de administración.

Los detalles de funcionamiento deberán obtenerse del documento SRS adjunto.

## 4. Diseño e identidad visual

Quiero una interfaz moderna, profesional y atractiva, relacionada con la programación competitiva y la tecnología.

El diseño debe transmitir:
- Comunidad.
- Competitividad.
- Aprendizaje.
- Tecnología.
- Profesionalismo académico.

Evita diseños genéricos de plantillas de IA.

Utiliza una jerarquía visual clara, tipografía moderna, espacios bien distribuidos, tarjetas visualmente atractivas, animaciones discretas y transiciones suaves.

La aplicación deberá contar con:
- Modo oscuro.
- Modo claro.
- Diseño responsive.
- Navegación intuitiva.
- Buena experiencia tanto en computadoras como en dispositivos móviles.

## 5. Consideraciones técnicas

Propón una arquitectura adecuada para una aplicación web full-stack.

Considera:
- React y TypeScript para el frontend.
- Una base de datos PostgreSQL.
- Autenticación segura.
- Control de acceso basado en roles.
- Almacenamiento persistente.
- Integración con servicios externos mediante API.
- Protección de información privada.

Puedes proponer Supabase como solución de backend.

Las claves privadas y credenciales de servicios externos nunca deberán exponerse en el frontend.

## 6. Alcance

Respeta estrictamente el alcance del MVP establecido en el documento.

No implementes funcionalidades marcadas como futuras o fuera del MVP, como las integraciones automáticas con otros jueces online o los sistemas de recomendaciones mediante inteligencia artificial.

## 7. Instrucciones antes de desarrollar

Por ahora NO escribas código ni construyas la aplicación.

Primero:

1. Analiza completamente el documento SRS.
2. Identifica las páginas y secciones que deberá tener la aplicación.
3. Propón una arquitectura de frontend y backend.
4. Propón el modelo de base de datos y sus relaciones.
5. Define los roles y permisos.
6. Identifica las integraciones externas necesarias.
7. Identifica posibles contradicciones, ambigüedades o requerimientos que necesiten aclaración.
8. Divide el desarrollo en etapas pequeñas y ordenadas.
9. Identifica qué funcionalidades pueden desarrollarse primero y cuáles dependen de otras.

No inventes reglas de negocio cuando el documento no las especifique.

Si encuentras decisiones que todavía no están definidas, pregúntame antes de asumirlas.

Presenta el plan completo para que pueda revisarlo y aprobarlo antes de comenzar a programar.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://guapa-club.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2875c439-a751-47e4-ac33-cf7f73fc7676).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
