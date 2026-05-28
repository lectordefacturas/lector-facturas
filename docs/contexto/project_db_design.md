---
name: project-db-design
description: Diseño aprobado de la base de datos en Supabase para el Ladrillo 1 — multi-hotel con RLS desde el inicio
metadata: 
  node_type: memory
  type: project
  originSessionId: 2e26e488-2e26-4446-9497-be7618fe575a
---

**Aprobado por el usuario en sesión inicial (2026-05-27).**

**Tablas (4):**
1. `hoteles` — id (uuid), nombre, slug, creado_en.
2. `miembros_hotel` — id, user_id (FK a auth.users), hotel_id (FK), rol (admin/operador). Tabla puente que RLS consulta para autorizar.
3. `articulos` — id, hotel_id (FK), codigo_gci (string), nombre, unidad, es_fruver (bool), creado_en.
4. `proveedores` — id, hotel_id (FK), codigo_gci (string), nombre, es_fruver (bool), creado_en.

**Decisiones de modelado:**
- **UUID** como tipo de id en todas las tablas (estándar Supabase, no enumerables).
- **`es_fruver` como columna boolean** en articulos y proveedores en lugar de tabla separada FRUVER (como hace el prototipo). Simplifica y mantiene mismo comportamiento: cuando proveedor.es_fruver=true → motor filtra articulos donde es_fruver=true.
- **RLS activado en las 4 tablas desde el día uno** — política basada en `miembros_hotel`: el usuario solo ve filas de los hoteles donde es miembro.

**Estructura del catálogo de origen (prototipo `gci_datos.js`):**
- Artículos: `{c: "00001252", n: "Abadejo", u: "kg"}` — c=código GCI, n=nombre, u=unidad ("kg", "un", "hor", "kcal", etc.).
- Proveedores: `{c: "00020", n: "25 DE MAYO S.R.L."}`.
- FRUVER: subset de artículos con misma estructura.
- PROVEEDORES_FRUVER: Set de códigos de proveedores que se tratan como fruver.

**Carga del catálogo real (1.854 artículos):** decisión del usuario — cuando su compañera le pase el Excel exportado de GCI, yo (Claude) escribo un script que lee el .xlsx y lo carga a Supabase. No carga manual por CSV.

**Seed para hoy:** Cala di Volpe + 5 artículos inventados + 2 proveedores inventados, todos con hotel_id apuntando a Cala di Volpe.

Relacionado: [[project-overview]].
