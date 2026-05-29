---
name: project-ladrillo6-done
description: Estado final del Ladrillo 6 (generar Excel GCI) — completado 2026-05-28. **El flujo completo del producto está cerrado.**
metadata: 
  node_type: memory
  type: project
  originSessionId: cb105876-5091-4efa-aa62-d7a2dfa54619
---

**Ladrillo 6 completado el 2026-05-28** (mismo día que L5).

**Significado:** este ladrillo cierra el **flujo principal end-to-end del producto**. El usuario ahora puede: subir foto de factura → la app la lee con IA → matchea contra catálogo → descargar Excel listo para importar al ERP GCI.

**Lo que hace este ladrillo:**

- Genera un archivo `.xlsx` con el **formato exacto** que espera el ERP **GCI** para importar facturas de compra (Tipo Transacción `FC002` — Factura de compra directa).
- Formato copiado fielmente del prototipo de Vale en [prototipo-original/GCI_Dashboard.html:434-449](prototipo-original/GCI_Dashboard.html).

**Estructura del Excel generado:**

```
A1: "Importación de Líneas de Transacción"
A3: Tipo Transacción: | FC002 | Factura de compra directa
A4: Empresa: | <nombre del hotel desde tabla hoteles>
A5: Moneda | <de Gemini>
A6: Proveedor | <de Gemini>
A7: Factura del proveedor | <nro de Gemini>
A12 (fila 12): cabeceras de columnas (Código Artículo, Nombre Artículo, Cantidad, UM Cantidad, Cantidad Bonificada, Precio, UM Precio, Centro de costo, Comentario)
A13: notas tipo "Requerido. Texto 30 Caracteres. ..."
A14+: las líneas de la factura
```

**Por línea:**
- Columna A (Código Artículo): `match.articulo.codigo_gci` (del matching de L5). Vacío si no hubo match.
- Columna B (Nombre Artículo): nombre del catálogo si hubo match; sino la descripción cruda de Gemini.
- Columna C (Cantidad): `linea.cantidad` (Gemini).
- Columna D (UM Cantidad): `match.articulo.unidad` (kg, un, m, ...).
- Columna E (Cantidad Bonificada): vacío.
- Columna F (Precio): `linea.precio_unitario` (Gemini).
- Columna G (UM Precio): igual que UM Cantidad.
- Columna H (Centro de costo): el que el usuario ingresó (campo obligatorio).
- Columna I (Comentario): vacío.

**Implementación:**

- [src/lib/gci-excel.ts](src/lib/gci-excel.ts): función `generarExcelGCI()` que arma el workbook con la lib `xlsx` (SheetJS). También `nombreArchivoGCI(nroFactura)` que arma el filename estilo `GCI_FC_7535_2026-05-28.xlsx`.
- [src/app/api/excel/route.ts](src/app/api/excel/route.ts): Route Handler POST `/api/excel`. Recibe JSON con `{ cabecera, lineas, centro_costo, empresa }`, valida auth (401 si no), arma el Excel, devuelve binario con `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` y `Content-Disposition: attachment; filename="..."`.
- En [src/app/factura/nueva/form.tsx](src/app/factura/nueva/form.tsx): nuevo componente `BotonDescargarExcel` que hace fetch al endpoint, recibe el blob, crea un `<a>` invisible con `download` y dispara click para forzar la descarga del lado del browser.

**Campo nuevo en el form:**

- **Centro de costo *** — `<input type="text" required maxLength={16}>`. Asterisco rojo visible. El server action valida que esté presente y que no exceda 16 caracteres (límite de GCI). Si está mal, devuelve error.

**Validaciones:**

- Server action ([src/app/factura/nueva/actions.ts](src/app/factura/nueva/actions.ts)):
  - `centro_costo` no vacío.
  - `centro_costo.length <= 16`.
- Route Handler (`/api/excel`):
  - User logueado (401 si no).
  - `cabecera`, `lineas`, `centro_costo` presentes.
  - `centro_costo` no vacío después de trim.

**Lo que NO hace este ladrillo (para ladrillos futuros):**

- **Cargar proveedores** + asignar **código GCI del proveedor** en la celda "Proveedor" del Excel. Hoy va solo el nombre.
- **Edición manual de las líneas** antes de descargar el Excel: si el algoritmo eligió mal el artículo o si Gemini se confundió con un precio, el usuario corrige en Excel a mano después de descargar. Implementación futura: tabla editable con dropdown para cambiar el match.
- **Persistencia de facturas procesadas** en la DB (tablas `facturas` y `lineas_factura`). Hoy es transient — la factura se procesa y se descarga, pero no queda guardada en Supabase.
- **Subir varias facturas a la vez** (pedido por Santi, sigue en backlog).

**Hito del proyecto:** con L6 cerrado, el producto tiene **valor demostrable real**. El usuario puede usarlo end-to-end con una factura real y obtener algo útil (un Excel para importar al ERP). De acá en adelante todo es mejora/refinamiento, no construcción de feature principal.

Relacionado: [[project-overview]], [[project-ladrillo3-done]], [[project-ladrillo5-done]], [[project-business-model]].
