# Lector de Facturas

Sistema multi-hotel que lee facturas con IA y genera la planilla Excel para
importar al ERP **GCI**. Producto SaaS en construcción por Santi + Vale.

URL pública: <https://lector-facturas-five.vercel.app/>

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions, Turbopack)
- **TypeScript** + **Tailwind CSS**
- **Supabase** (Postgres + Auth + RLS)
- **Gemini API** (`gemini-2.5-flash`) para lectura de facturas
- **Vercel** para hosting (auto-deploy desde GitHub)

## Setup en una compu nueva

Solo se necesita **Node** y **Git** ya instalados.

```powershell
git clone https://github.com/lectordefacturas/lector-facturas.git
cd lector-facturas
npm install
npm run dev
```

Abrir <http://localhost:3000>. El archivo `.env.local` ya está en el repo
(decisión consciente, ver [docs/contexto/README.md](docs/contexto/README.md)).

## Estructura

```
src/
├── proxy.ts                   # Refresca sesión de Supabase en cada request
├── lib/
│   ├── supabase/              # Clientes server/client/middleware de Supabase SSR
│   └── gemini.ts              # Cliente REST de Gemini para leer facturas
└── app/
    ├── page.tsx               # Home: catálogo del hotel del usuario logueado
    ├── login/                 # Formulario de login (email + password)
    └── factura/nueva/         # Subir factura → Gemini → tabla de líneas

docs/contexto/                 # Memorias del proyecto para Claude (multi-compu)
prototipo-original/            # Prototipo viejo de Vale, gitignored (datos sensibles)
```

## Continuar trabajando con Claude

Al abrir Claude Code en este proyecto desde cualquier compu, decirle al inicio:

> "Leé los archivos de `docs/contexto/` para retomar el contexto del proyecto.
> Empezá por `MEMORY.md`."
