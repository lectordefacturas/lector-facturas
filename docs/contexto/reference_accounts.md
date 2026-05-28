---
name: reference-accounts
description: Cuentas y servicios externos del proyecto — dónde vive cada cosa
metadata: 
  node_type: memory
  type: reference
  originSessionId: 2e26e488-2e26-4446-9497-be7618fe575a
---

**Gmail del proyecto:** `lectordefacturas@gmail.com` (creado 2026-05-27, exclusivo del proyecto). Es la cuenta dueña de Supabase, Vercel y API de Gemini.

**Supabase:** creado el 2026-05-27, proyecto `lector-facturas` en São Paulo. Login vía Google con el Gmail del proyecto. Ver [[project-ladrillo1-done]].

**GitHub:** cuenta creada el 2026-05-27 con `lectordefacturas@gmail.com`. Repo: `lector-facturas` (privado).

**Vercel:** cuenta creada 2026-05-27 con `lectordefacturas@gmail.com`. Team: `lectordefacturas-8629` (plan Hobby/gratis). Proyecto `lector-facturas` conectado al repo de GitHub — auto-deploy en cada push a `main`. URL pública: https://lector-facturas-five.vercel.app

**Gemini API (Google AI Studio):** pendiente. El prototipo usa `gemini-2.5-flash` (modelo gratis) — ver `prototipo-original/server.py`.

**Nota de seguridad:** las contraseñas y API keys NO se guardan en memoria ni se piden por chat. El usuario las guarda en su propio gestor.
