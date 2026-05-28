---
name: project-ladrillo2-progress
description: Estado final del Ladrillo 2 (Next.js + Vercel + Supabase con auth) — COMPLETO 2026-05-27
metadata: 
  node_type: memory
  type: project
  originSessionId: cb105876-5091-4efa-aa62-d7a2dfa54619
---

**Ladrillo 2 completado el 2026-05-27** (mismo día que el Ladrillo 1, sesión larga desde la compu de casa).

**Sub-pasos completados:**

1. ✅ Verificado Node 24.14.1, npm 11.11.0, Git 2.53 — ya estaban instalados.
2. ✅ Proyecto Next.js 16.2.6 creado en `c:\Users\Santi\Desktop\lector-facturas` con TypeScript, Tailwind, ESLint, App Router, Turbopack, `src/`. Git auto-inicializado.
3. ✅ Push a GitHub: repo privado `lectordefacturas/lector-facturas`, rama `main`.
4. ✅ Deploy a Vercel: team `lectordefacturas-8629` (Hobby), URL https://lector-facturas-five.vercel.app, auto-deploy en cada push.
5. ✅ Conexión Next.js ↔ Supabase: `@supabase/supabase-js` instalado, página lee `articulos` desde DB, RLS bloquea sin auth.
6. ✅ Auth Supabase email+password: `@supabase/ssr` instalado, clientes server/client/middleware, proxy.ts (no middleware.ts en Next.js 16), página de login `/login`, server actions de login/logout. Email confirmation deshabilitado vía "Auto Confirm User" al crear cada usuario en el dashboard.
7. ✅ Pantalla login + listado catálogo: título dinámico por hotel (lee de tabla `hoteles`, no hardcodeado), botón cerrar sesión, mensajes contextuales según estado de sesión.
8. ✅ Usuarios reales creados:
   - `lectordefacturas@gmail.com` → usuario del proyecto/empresa, **SIN vincular a ningún hotel**. Reservado para futuro rol "super admin del sistema".
   - `prueba@cala-di-volpe.test` (password `prueba123`) → usuario de prueba vinculado a Cala di Volpe como `admin` en `miembros_hotel`. Se borrará cuando Cala se vuelva cliente real y los empleados creen sus cuentas verdaderas.

**Pruebas que ya pasaron (en producción):**

- ✅ Login con `prueba@cala-di-volpe.test` → ve los 5 artículos de Cala (TEST-001 a TEST-003 normales, TEST-FV-001 y TEST-FV-002 fruver).
- ✅ Login con `lectordefacturas@gmail.com` → ve "Artículos visibles: 0" + mensaje "no vinculado a ningún hotel". **Prueba negativa pasada → la regla sagrada está blindada (no basta con estar logueado, hay que ser miembro).**
- ✅ Sin login → "Sin sesión activa", título genérico "Lector de facturas".

**Arquitectura del frontend (resumen para futuras sesiones):**

```
src/
├── proxy.ts                          # Next.js 16: era middleware.ts. Refresca sesión Supabase en cada request.
├── lib/supabase/
│   ├── server.ts                     # createClient() para Server Components/Actions (lee cookies de next/headers)
│   ├── client.ts                     # createClient() para Client Components (browser)
│   └── middleware.ts                 # updateSession() — helper usado por proxy.ts
└── app/
    ├── page.tsx                      # Home: lee user + hotel + articulos. Botón Ingresar/Cerrar sesión según estado.
    └── login/
        ├── page.tsx                  # Form de login (email + password)
        └── actions.ts                # "use server" → login() y logout() con redirect+revalidatePath
```

**Variables de entorno (idénticas en `.env.local` y en Vercel):**
- `NEXT_PUBLIC_SUPABASE_URL=https://eetchuqejhherddlkjlb.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable__zg3b9LYHZZ2V-kJNow4CA_rmogH4Mt`

**Aprendizajes del Ladrillo 2 (para no tropezar de nuevo):**

- En Vercel, las variables `NEXT_PUBLIC_*` **NO** deben marcarse como "Sensitive". El prefijo es "pública por diseño"; "Sensitive" lo contradice y Vercel deja la variable inaccesible en el build → error tipo "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL". Vercel auto-tildó "Sensitive" al detectar formato de API key; hay que destildarlo a mano.
- Supabase nueva generación de keys: `sb_publishable_...` (anon viejo) y `sb_secret_...` (service_role viejo).
- En Next.js 16+: `middleware.ts` está **deprecado**, se llama `proxy.ts`. La función exportada se llama `proxy`, no `middleware`. Sigue funcionando igual.
- Windows Git Credential Manager: si hay credenciales viejas de otro usuario de GitHub, el push falla 403. Solución: `cmdkey /delete:LegacyGeneric:target=git:https://github.com` + reintentar (abre flujo de auth nuevo).
- `create-next-app .` rechaza directorios no vacíos. Workaround: mover el contenido temporalmente, crear el proyecto, mover de vuelta.
- `prototipo-original/` gitignored — contiene `api_key.txt` (Gemini) y facturas reales (JPGs), no se sube.
- En Supabase nuevo dashboard, el toggle "Confirm email" del provider no es visible — se controla por usuario al crearlo ("Auto Confirm User" tildado).

**Próximo paso: Ladrillo 3.** Hipótesis: cargar el catálogo real de Cala (Excel de 1.854 artículos) + tabla `facturas`/`lineas_factura` + integración con Gemini para leer un JPG de factura. Confirmar prioridad con Santi al iniciar próxima sesión.

Relacionado: [[project-overview]], [[project-business-model]], [[project-ladrillo1-done]], [[project-db-design]], [[reference-accounts]].
