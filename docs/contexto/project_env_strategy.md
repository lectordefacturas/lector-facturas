---
name: project-env-strategy
description: Estrategia de manejo de .env.local entre compus tras el incidente de GitGuardian (2026-05-28)
metadata: 
  node_type: memory
  type: project
  originSessionId: cb105876-5091-4efa-aa62-d7a2dfa54619
---

**Decisión consciente (revisada tras incidente):** `.env.local` NUNCA se versiona, ni siquiera en repos privados.

**Why:** el 2026-05-28 GitGuardian detectó la `GEMINI_API_KEY` filtrada minutos después del commit que la subió al repo (commit 3080305 — el de "Permitir continuar en otra compu"). Aunque el repo era privado, GitGuardian escanea repos privados también por acuerdos con GitHub. La key fue rotada al instante y todo siguió funcionando, pero queda como lección clara: **el supuesto de "repo privado = secrets seguros" es FALSO**.

**How to apply:**
- `.env.local` siempre en `.gitignore` sin excepciones (`!.env.local` NO).
- Nunca proponer "subir `.env.local` al repo aunque sea privado" como atajo de UX. Aunque el usuario insista por simplicidad, explicar el riesgo de scanners automáticos y proponer alternativas.
- **Update 2026-05-28 (mismo día):** Santi decidió **trabajar solo en una compu** (la de casa) hasta terminar el proyecto. Ya no hay necesidad de sincronizar `.env.local` entre máquinas. La estrategia queda en su forma más simple: `.env.local` vive solo localmente, nunca se sube.
- Si más adelante vuelve a necesitar otra compu, usar el gestor de contraseñas (opción A) o Vercel CLI (opción B) — pero no es problema actual.
- La key vieja `AIzaSyD3VZL_qVsphG7ILlLvfODiBYObD2Wd9ws` queda inutilizada (borrada en Google AI Studio). En el historial de Git sigue existiendo en el commit 3080305, pero ya no sirve.
- Nueva key (formato Google AI Studio nuevo, prefijo `AQ.`): vive en `.env.local` local y en Vercel (Project-level, Sensitive).

**Detalle técnico nuevo:** Google AI Studio cambió el formato de keys. Antes: `AIzaSy...` (39 chars). Ahora: `AQ.Ab8R...` (~53 chars, prefijo `AQ.`). Ambos formatos funcionan en `https://generativelanguage.googleapis.com/v1beta/models/...:generateContent?key=<KEY>`.

Relacionado: [[project-ladrillo3-done]], [[reference-accounts]], [[feedback-memory-sync]].
