---
name: project-ladrillo4-done
description: Estado final del Ladrillo 4 (catálogo real cargado a Supabase) — completado 2026-05-28
metadata: 
  node_type: memory
  type: project
  originSessionId: cb105876-5091-4efa-aa62-d7a2dfa54619
---

**Ladrillo 4 completado el 2026-05-28.** Catálogo real de Cala di Volpe cargado a Supabase + arreglos colaterales en Gemini y home.

**Lo que se hizo:**

- **Cargado el catálogo real**: 1.902 artículos a `articulos` (tabla de Supabase).
- **Archivo fuente**: `prototipo-original/ArCA01-4783.xlsx` (export de GCI, ~87 KB, 5 columnas: Código Alternativo, Unidad, Artículo, Nombre, Tipo de Código Alt.).
- **Mapeo aplicado** (columnas del Excel → columnas de la tabla):
  - `Artículo` (columna C, ej `00000189`) → `codigo_gci`
  - `Nombre` (columna D, ej `Transformador dicroica 12 v`) → `nombre`
  - `Unidad` (columna B, ej `un`, `kg`, `m`) → `unidad` (con `(Ninguna)` normalizado a `""`)
  - **103 artículos marcados es_fruver=true** según el `Set FRUVER` del [prototipo-original/gci_datos.js](prototipo-original/gci_datos.js) de Vale.
- **Artículos TEST seed (5)** borrados antes de cargar — ya cumplieron su rol del Ladrillo 1.
- **Cómo se ejecutó**: script TypeScript [scripts/load-catalog.ts](scripts/load-catalog.ts) que:
  - Lee `.env.local` con `dotenv` (path explícito).
  - Se loguea como `prueba@cala-di-volpe.test` (NO usa service_role — RLS deja insertar porque ese usuario es `admin` de Cala).
  - Inserta en lotes de 500 (4 lotes × 500 + 1 × 402).
  - Tiempo total: ~20 segundos.
- **Script de inspección** [scripts/inspect-catalog.ts](scripts/inspect-catalog.ts) — quedó en el repo como utilidad para futuros catálogos (otros hoteles).

**Cambios colaterales en la app:**

- **Bug fix Gemini**: `maxOutputTokens` subido de 2048 → 8192 en [src/lib/gemini.ts](src/lib/gemini.ts). El límite anterior cortaba la respuesta en facturas largas (>15 líneas) — el modelo `gemini-2.5-flash` usa "thinking tokens" internos que consumen presupuesto. Probado con factura BONPOINT de 19 líneas que antes rompía con `Expected ',' or '}' after property value in JSON at position 1413`. Ahora funciona.
- **Mejor manejo de error** en parseo de JSON de Gemini: incluye `finishReason` para distinguir si Gemini cortó (`MAX_TOKENS`) vs JSON malformado por otra razón.
- **Home con conteo total + paginación básica**: la query antes traía hasta 1000 (cap default de Supabase) sin orden. Ahora: una query separada con `count: 'exact', head: true` devuelve el total real, y la lista se limita a los primeros 50 artículos ordenados alfabéticamente. Mensaje: "Mostrando los primeros 50 (orden alfabético). La búsqueda y paginación llegan en un próximo paso."

**Dependencias nuevas (devDependencies):**
- `xlsx` (SheetJS) — leer .xlsx desde Node.
- `tsx` — ejecutar scripts TypeScript directo (sin compilar).
- `dotenv` — cargar `.env.local` desde scripts standalone.

**Verificación final:**
- Conteo en DB: **1.902 artículos** (`select count(*) from articulos where hotel_id = ...`).
- Conteo de fruver: **103**.
- Home en producción muestra "Artículos en catálogo: 1902" correctamente.
- Factura BONPOINT (19 líneas) procesada sin errores con el nuevo límite de Gemini.

**Cosas que NO hace este Ladrillo (quedan para los siguientes):**

- Búsqueda / paginación real en el catálogo de la UI.
- Cargar proveedores (Vale aún no pasó ese Excel — sub-paso futuro).
- Matching de las líneas extraídas por Gemini contra el catálogo — **próximo gran salto**.
- Tablas `facturas` y `lineas_factura` para persistir lo procesado.
- Generación del Excel GCI.
- **Subir varias facturas a la vez** (pedido por Santi 2026-05-28). Implica: `<input type="file" multiple>`, procesamiento en paralelo, UI con cola de progreso. Conviene hacerlo DESPUÉS de tener persistencia de facturas en DB, sino mostrar 10 tablas perdidas en una página queda desordenado.

**Próximo paso natural:** **Matching contra catálogo**. Que cuando Gemini devuelve `descripcion: "champi bandeja"` el sistema lo conecte con el artículo de código `00001558` ("CHAMPIÑON BANDEJA") del catálogo. Reaprovechar la lógica `bestArt` del [prototipo-original/GCI_Dashboard.html](prototipo-original/GCI_Dashboard.html) (cierta normalización + fuzzy match). Esto desbloquea el camino al Excel final.

Relacionado: [[project-overview]], [[project-business-model]], [[project-ladrillo3-done]], [[project-db-design]], [[reference-accounts]].
