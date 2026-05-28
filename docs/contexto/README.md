# Contexto para Claude

Esta carpeta contiene los archivos de memoria del proyecto. Viajan con el repo
para que cuando se arranque Claude Code en otra compu, todo el contexto siga
disponible sin tener que pegarlo a mano.

## Cómo usar al arrancar Claude en una compu nueva

Al abrir Claude Code en el proyecto desde otra máquina, decirle al inicio de la
conversación algo como:

> "Leé todos los archivos de [docs/contexto/](.) excepto este README para
> retomar el contexto del proyecto. Empezá por `MEMORY.md` que es el índice."

Claude va a leer cada `.md` y entender quién es el usuario, cómo trabajar con
él, qué se hizo en cada Ladrillo, etc.

## Cómo mantenerlos al día

Si Claude actualiza alguna memoria (lo hace solo cuando aprende algo nuevo
relevante), se actualizan en `C:\Users\Santi\.claude\projects\…\memory\` —
hay que pedirle que copie los cambios también acá antes de cerrar la sesión, o
sincronizar manualmente. El `MEMORY.md` que está acá es el espejo del oficial.

## Sobre `.env.local` (importante)

A diferencia de la práctica habitual, **`.env.local` SÍ está en el repo** (ver excepción en `.gitignore`). Razón: Santi trabaja entre dos compus y quiere fricción cero. El trade-off consciente: el repo es **privado** y él es el único user.

⚠️ **Si alguna vez se hace el repo público o se suma alguien externo:**
1. `git rm --cached .env.local`
2. Agregar `.env.local` al `.gitignore` sin la excepción.
3. **Rotar las 3 keys** (regenerar nuevas en Supabase, Google AI Studio, etc.) porque las viejas quedaron en el historial de Git.
4. Actualizar Vercel con las keys nuevas.

## Archivos

- `MEMORY.md` — índice maestro, leerlo primero.
- `user_profile.md` — quién es Santiago.
- `feedback_*.md` — cómo trabajar con él (reglas de colaboración).
- `project_overview.md` — qué es el producto.
- `project_business_model.md` — modelo de negocio (Santi+Vale como fundadores).
- `project_db_design.md` — diseño de la base de datos.
- `project_ladrillo1_done.md` — estado del Ladrillo 1 (DB en Supabase).
- `project_ladrillo2_progress.md` — estado del Ladrillo 2 (Next.js + Vercel + auth).
- `project_ladrillo3_done.md` — estado del Ladrillo 3 (lectura de facturas con Gemini).
- `reference_accounts.md` — qué cuenta vive en qué servicio.
