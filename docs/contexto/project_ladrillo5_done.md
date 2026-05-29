---
name: project-ladrillo5-done
description: Estado final del Ladrillo 5 (matching contra catálogo con fuse.js) — completado 2026-05-28
metadata: 
  node_type: memory
  type: project
  originSessionId: cb105876-5091-4efa-aa62-d7a2dfa54619
---

**Ladrillo 5 completado el 2026-05-28** (junto con el 6, en la misma sesión).

**Objetivo:** que cuando Gemini extrae líneas como `"champi bandeja"`, el sistema sugiera automáticamente el artículo correcto del catálogo (`00001558 - CHAMPIÑON BANDEJA`).

**Cómo se hizo:**

- **Librería**: `fuse.js` (fuzzy search standard de JS, ~50 KB). Evita reinventar el algoritmo de Levenshtein/trigrams.
- **Archivo**: [src/lib/catalog-match.ts](src/lib/catalog-match.ts) exporta `crearMatcher(catalogo)` que devuelve una función `matchArticulo(descripcion)`.
- **Config de Fuse**: `threshold: 0.4`, `distance: 200`, `ignoreLocation: true`, `minMatchCharLength: 2`. Calibrado para descripciones cortas de facturas.
- **Normalización**: lowercase + sin acentos (NFD + remove combining marks) + colapsar espacios + sacar caracteres no alfanuméricos antes de matchear. Resuelve "Champi" vs "CHAMPIÑON" sin perder señal.
- **Score → confianza**: Fuse devuelve score 0 (perfecto) → 1 (peor). Lo invertimos a 0-100 para mostrar como porcentaje en la UI.

**Integración con el flujo existente:**

- En [src/app/factura/nueva/actions.ts](src/app/factura/nueva/actions.ts), después de Gemini, el server action ahora también:
  1. Trae todo el catálogo (`select id, codigo_gci, nombre, unidad, es_fruver from articulos`).
  2. Crea el matcher.
  3. Para cada línea de Gemini, hace `match(l.descripcion)`.
  4. Devuelve `lineas: LineaConMatch[]` donde cada línea tiene `.match: MatchResult | null`.

**UI** ([src/app/factura/nueva/form.tsx](src/app/factura/nueva/form.tsx)):

- Nueva columna "Match catálogo" en la tabla de líneas detectadas.
- Cada match muestra: código GCI, nombre del catálogo, y un **badge de confianza** con colores:
  - 🟢 verde si ≥80%
  - 🟡 amarillo si 60-79%
  - 🔴 rojo si <60%
- Si no encuentra match razonable: "sin match" en gris itálica.

**Limitaciones conocidas (a resolver en ladrillos futuros):**

- **No restringe por proveedor fruver**: el prototipo de Vale (`bestArt` en [GCI_Dashboard.html](prototipo-original/GCI_Dashboard.html)) restringía la búsqueda solo a los 103 fruver cuando el proveedor estaba marcado como fruver. Nosotros buscamos siempre contra los 1.902 enteros. Cuando carguemos proveedores (próximo paso natural) podemos agregar esta restricción.
- **No editable**: si el algoritmo eligió mal, el usuario no puede cambiar el match desde la UI. Hoy lo arregla a mano en el Excel después de descargar. Edición inline = ladrillo futuro.

**Dependencia nueva**: `fuse.js` agregada como dependency.

Relacionado: [[project-overview]], [[project-ladrillo3-done]], [[project-ladrillo4-done]], [[project-ladrillo6-done]], [[project-db-design]].
