---
name: project-ladrillo7-done
description: Estado final del Ladrillo 7 (proveedores cargados + UI editable estilo prototipo Vale) — 2026-05-28
metadata: 
  node_type: memory
  type: project
  originSessionId: cb105876-5091-4efa-aa62-d7a2dfa54619
---

**Ladrillo 7 completado el 2026-05-28** (tercer día seguido de trabajo intenso). Cierra el gap visible con el prototipo de Vale: el producto ahora permite editar la factura procesada antes de exportar el Excel.

**Estructura del ladrillo:**

- **7.A — Cargar proveedores** (10 min, ya hecho)
- **7.B — UI editable** (90 min, ya hecho)

## 7.A — Proveedores

- **334 proveedores reales** cargados a Supabase desde [prototipo-original/gci_datos.js](prototipo-original/gci_datos.js).
- **2 marcados como fruver**:
  - `00113 Cirigliano De Armas Alejandro Jesus`
  - `00289 FERVAL PRODUCTOS NATURALES S.A.S`
- Los **2 proveedores TEST seed** del Ladrillo 1 fueron borrados.
- Script: [scripts/load-providers.ts](scripts/load-providers.ts) (similar al de catálogo del L4).
- El script usa `prueba@cala-di-volpe.test` como auth (RLS pasa porque es admin del hotel).

## 7.B — UI editable

**Cambio mayor:** la pantalla `/factura/nueva` se reorganiza completa, similar al dashboard del prototipo de Vale.

**Layout nuevo:**

```
┌─────────────────────────────────────────────────────────┐
│ Header: 1902 artículos · 334 proveedores · Cala · FC002 │
├──────────────┬──────────────────────────────────────────┤
│ 📷 FOTO      │ 📄 DATOS DE LA FACTURA                  │
│ + Leer       │   Proveedor* (autocomplete sobre 334)    │
│ factura      │   Nº Factura* / Fecha / Moneda / CC*     │
│              ├──────────────────────────────────────────┤
│              │ 🧾 LÍNEAS DE LA FACTURA                  │
│              │   Tabla editable                         │
│              │   + Agregar línea / Limpiar / ↓ Excel    │
└──────────────┴──────────────────────────────────────────┘
```

**Archivos nuevos:**

- [src/app/factura/nueva/page.tsx](src/app/factura/nueva/page.tsx) — Server Component: trae catálogo + proveedores completos (range 0,9999 para superar el cap de 1000), los pasa al editor. También trae conteos y el nombre del hotel.
- [src/app/factura/nueva/editor.tsx](src/app/factura/nueva/editor.tsx) — Client Component grande con todo el editor. Mantiene estado completo de cabecera + líneas. Se hidrata desde la action cuando Gemini procesa.
- [src/app/factura/nueva/autocomplete.tsx](src/app/factura/nueva/autocomplete.tsx) — Componente reutilizable de autocomplete. Filtrado client-side por substring. Usado para proveedores y artículos. Maneja focus/blur + dropdown.

**Archivos modificados:**

- [src/app/factura/nueva/actions.ts](src/app/factura/nueva/actions.ts) — sacado el `centro_costo` (ahora se edita en la cabecera, no en el form de upload). El action solo recibe imagen y devuelve cabecera + líneas con matches.
- [src/app/factura/nueva/form.tsx](src/app/factura/nueva/form.tsx) — **borrado**, reemplazado por `editor.tsx`.

**Decisiones clave del editor:**

- **Estado local del cliente**: el resultado del Server Action es **punto de partida**, no estado final. Un `useEffect` sincroniza desde el resultado de la action al estado del form cuando el resultado cambia (identidad). El usuario edita el estado del form, y al descargar se envía el estado del form (no el del action).
- **Autocomplete client-side**: 1.902 artículos + 334 proveedores se mandan al cliente como props. Total ~150 KB en el bundle. Es aceptable, evita ida-y-vuelta al servidor en cada keystroke del autocomplete.
- **Proveedor con código GCI**: si el usuario seleccionó del autocomplete, el Excel se genera con `"CODIGO - Nombre"` (formato exacto del prototipo de Vale). Si tipeó libre, va solo el nombre.
- **Fecha**: Gemini devuelve `DD/MM/YYYY`. El input HTML `type="date"` requiere `YYYY-MM-DD`. Hay una función `parseFecha()` que hace la conversión al sincronizar.

**Comparativa con el prototipo de Vale (estado actual):**

| Feature | Vale | Nosotros |
|---|---|---|
| Editar cabecera | ✅ | ✅ |
| Editar líneas (todas las celdas) | ✅ | ✅ |
| Autocomplete proveedores con código GCI | ✅ | ✅ |
| Autocomplete artículos con código GCI + unidad auto | ✅ | ✅ |
| Agregar / quitar línea | ✅ | ✅ |
| Comentario por línea | ✅ | ✅ |
| Centro de costo por línea (opcional) | ✅ | ✅ (se ingresa, pero **no se manda al Excel — usa solo el global**) |
| Tags "✓ Auto / ✕ Editar" | ✅ | ❌ (saltado, nice-to-have) |
| Filtro fruver-only cuando el proveedor es fruver | ✅ | ❌ (próximo paso) |
| Generar Excel con valores **editados** | ✅ | ✅ |
| Persistir factura en DB | ❌ (Vale tampoco lo hacía) | ❌ |
| Subir varias facturas | ❌ | ❌ (pedido por Santi, backlog) |

**Pendientes intencionales:**

- El centro de costo por línea se captura en el input pero no se manda al Excel — todas las líneas usan el centro de costo global. Para implementar correctamente habría que extender el formato del Excel (que ya tiene la columna "Centro de costo" por línea) para enviar el valor por línea, con fallback al global. Sub-paso futuro.
- Tags "Auto/Editar" para mostrar qué cambió el usuario después del análisis IA. Nice-to-have, no urgente.
- Filtro fruver-only: cuando el proveedor seleccionado es marcado como fruver (los 2 de la DB), restringir el autocomplete de artículos solo a fruver. Es de 10 minutos pero queda para próximo ladrillo.

**Hito del proyecto:** el producto ya es **funcionalmente equivalente al prototipo de Vale** (con menos pulido visual pero misma capacidad). Lo que sigue es refinamiento + features que el prototipo no tenía (persistencia en DB, multi-hotel real, subir varias facturas).

**Próximo paso natural:** Decidir entre:
1. **Persistir facturas** procesadas en DB (tablas `facturas` + `lineas_factura`). Habilita historial, edición offline, recordar, etc.
2. **Filtro fruver** (10 min, mejora UX inmediata).
3. **Subir varias facturas** (pedido de Santi).
4. **Pulido visual** (íconos, mejores espacios, etc.).

Relacionado: [[project-overview]], [[project-business-model]], [[project-ladrillo4-done]], [[project-ladrillo5-done]], [[project-ladrillo6-done]], [[project-db-design]].
