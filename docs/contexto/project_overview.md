---
name: project-overview
description: "Lector de facturas multi-hotel que genera planillas para importar al ERP \"GCI\" usado por hoteles uruguayos"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2e26e488-2e26-4446-9497-be7618fe575a
---

**Producto:** sistema web que lee facturas de compra de hoteles (con IA) y genera la planilla Excel que el ERP **GCI** necesita para importarlas.

**Modelo de negocio:** vender a varios hoteles. Arquitectura **multi-hotel desde el día uno** — un solo sistema, espacio aislado por hotel (catálogo, proveedores, facturas). Regla sagrada: un hotel jamás ve datos de otro.

**Primer cliente / banco de pruebas:** hotel **Cala di Volpe** (Uruguay). Es el propio hotel del usuario.

**Stack acordado:**
- Frontend/backend: Next.js sobre Vercel
- Base de datos + auth: Supabase
- IA lectora de facturas: API de Gemini (Google)
- Cuenta Gmail dedicada al proyecto (a crear: lectordefacturas...@gmail.com)

**Material existente (carpeta `prototipo-original/`):**
- `GCI_Dashboard.html` — prototipo funcionando. Motor que traduce productos → códigos GCI + generador de Excel. **Reaprovechar, no tirar.**
- `gci_datos.js` — catálogo hardcodeado de Cala di Volpe (1.854 artículos + proveedores). Referencia de estructura, se reemplaza por DB.
- `server.py` — servidor que llama a Gemini. Su lógica migra a Next.js.
- JPGs de facturas reales para tests.

**Plan por "ladrillos":**
- Ladrillo 1 (sesión actual): fundación DB en Supabase con RLS multi-hotel desde el inicio. Tablas mínimas hoy: `hoteles`, `articulos`, `proveedores`. Datos seed: Cala di Volpe + 5 artículos + 2 proveedores inventados.
- Próximas sesiones: Next.js + Vercel, integración Gemini, motor GCI portado a JS, UI.

**Why:** el usuario quiere construir sobre fundaciones probadas antes de levantar el edificio. No mezclar ladrillos.
**How to apply:** no avanzar a Next.js/Vercel/Gemini hasta que la DB esté verificada por el usuario en Supabase.
