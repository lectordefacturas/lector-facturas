---
name: project-ladrillo1-done
description: Estado final del Ladrillo 1 (DB en Supabase) — completado 2026-05-27. Punto de partida del Ladrillo 2.
metadata: 
  node_type: memory
  type: project
  originSessionId: 2e26e488-2e26-4446-9497-be7618fe575a
---

**Ladrillo 1 completado el 2026-05-27.** Toda la sesión guiada paso a paso (usuario no programador, copy-paste de SQL al SQL Editor de Supabase).

**Lo que quedó funcionando:**
- Proyecto Supabase: `lector-facturas`, región **South America (São Paulo)**, login con `lectordefacturas@gmail.com` vía Google.
- Settings al crear el proyecto: Data API ON, Automatically expose new tables ON, **Enable automatic RLS ON** (decisión clave: cualquier tabla nueva queda con RLS prendido por defecto).
- **4 tablas en schema `public`:** `hoteles`, `miembros_hotel`, `articulos`, `proveedores`. UUID como id en todas. FKs con `on delete cascade`.
- **Función auxiliar:** `public.es_miembro_de(_hotel_id uuid) returns boolean` — `security definer`, consulta `miembros_hotel` para `auth.uid()`. Es la que usan todas las políticas.
- **4 políticas RLS:**
  - `hoteles_select_si_miembro` (SELECT, authenticated, using `es_miembro_de(id)`)
  - `miembros_select_propias` (SELECT, authenticated, using `user_id = auth.uid()`)
  - `articulos_solo_mi_hotel` (FOR ALL, authenticated, using + with check `es_miembro_de(hotel_id)`)
  - `proveedores_solo_mi_hotel` (FOR ALL, authenticated, using + with check `es_miembro_de(hotel_id)`)
- **Seed:** Cala di Volpe (slug `cala-di-volpe`) + 5 artículos `TEST-*` (3 normales, 2 fruver) + 2 proveedores `TEST-PROV-*` (1 normal, 1 fruver).
- `miembros_hotel` vacía — no hay usuarios reales aún (eso es Ladrillo 2).

**No se hizo todavía:**
- Prueba en vivo de RLS con dos usuarios reales (requiere auth funcionando — Ladrillo 2).
- Carga del catálogo real de 1.854 artículos (esperando Excel exportado de GCI de la compañera del usuario).
- Tabla `facturas` y `lineas_factura` (Ladrillo 3 o cuando toque).
- Cualquier cosa de Next.js / Vercel / Gemini.

**Punto de partida para el Ladrillo 2 (próxima sesión):**
- Crear proyecto Next.js + deploy a Vercel.
- Configurar Supabase Auth (probablemente magic link o email/password).
- Conectar Next.js a Supabase con `supabase-js`.
- Primera pantalla: login + listado de catálogo del hotel del usuario logueado. **Eso ya prueba RLS de verdad.**
- Crear primer usuario real para Cala di Volpe e insertar manualmente fila en `miembros_hotel` vinculándolo.

Relacionado: [[project-overview]], [[project-db-design]], [[reference-accounts]].
