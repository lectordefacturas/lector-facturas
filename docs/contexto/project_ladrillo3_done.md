---
name: project-ladrillo3-done
description: Estado final del Ladrillo 3 (lectura de facturas con Gemini) — completado 2026-05-28
metadata: 
  node_type: memory
  type: project
  originSessionId: cb105876-5091-4efa-aa62-d7a2dfa54619
---

**Ladrillo 3 completado el 2026-05-28** (sesión arrancó 2026-05-27 con el Ladrillo 2, continuó al día siguiente). Único objetivo del ladrillo: subir una imagen JPG/PNG de una factura → la app la manda a Gemini → te devuelve los datos extraídos en pantalla.

**Lo que quedó funcionando:**

- API key de Gemini (Google AI Studio) creada con `lectordefacturas@gmail.com`. Guardada en `.env.local` local y en Vercel a nivel **Project** (no Team/Shared) con flag "Sensitive" tildado. Variable: `GEMINI_API_KEY`.
- Sin SDK — llamada REST directa a `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent` desde un Server Action (sin librería adicional).
- Modelo: `gemini-2.5-flash` (gratis dentro de la cuota libre).
- Prompt reaprovechado del prototipo de Vale ([prototipo-original/server.py](prototipo-original/server.py)) + se agregó `responseMimeType: 'application/json'` y `responseSchema` para garantizar JSON estructurado.
- Schema extraído: `{ proveedor_nombre, nro_factura, fecha (DD/MM/YYYY), moneda (UYU/USD/EUR), lineas: [{ descripcion, cantidad, precio_unitario }] }`.
- Auth gate: la ruta `/factura/nueva` y el server action exigen sesión válida (redirect a `/login`). Sin esto cualquiera podría usar la API key.
- Limit de tamaño: 4 MB por archivo (configurado en [next.config.ts](next.config.ts) `experimental.serverActions.bodySizeLimit`).
- UI: form con `<input type="file" accept="image/jpeg,image/png">`, botón con estado pending ("Procesando con Gemini..."), tabla de resultado con cabecera + líneas detectadas + subtotal calculado en pantalla (cantidad × precio_unitario).
- Probado en producción con factura real de BONPOINT S.A. (frutería) — extrajo proveedor, n° factura "A 7544", fecha 03/03/2026, moneda UYU, 15 líneas fruver. Lectura correcta.

**Archivos clave:**

```
src/
├── lib/gemini.ts                 # Cliente Gemini con fetch + responseSchema
└── app/factura/nueva/
    ├── page.tsx                  # Server Component: auth gate + montaje del form
    ├── form.tsx                  # Client Component: useActionState + tabla resultado
    └── actions.ts                # Server Action: validación + procesarFactura()
```

**Lo que GCI necesita del Excel final (referencia, no implementado aún):**

Columnas del Excel de importación que arma el prototipo de Vale ([GCI_Dashboard.html:441](prototipo-original/GCI_Dashboard.html#L441)):

1. Código Artículo (req, 30 chars) — falta: matching contra catálogo
2. Nombre Artículo (opc, 50 chars)
3. Cantidad (num 3 dec) — **lo extraemos**
4. UM Cantidad (req, 5 chars) — viene del catálogo (`kg`, `un`, `hor`, etc.)
5. Cantidad Bonificada (opc)
6. Precio (num 2 dec) — **lo extraemos como `precio_unitario`**
7. UM Precio (req si precio, 5 chars)
8. Centro de costo (req, 16 chars) — selección del usuario al cargar
9. Comentario (opc)

**GCI NO pide:** total, subtotal, IVA. Los calcula internamente con cantidad × precio. Vale tampoco enviaba el total — lo mostraba solo en pantalla para control visual del usuario.

**Aprendizajes del Ladrillo 3:**

- Vercel tiene dos lugares para env vars: a nivel **Team/Shared** o a nivel **Project**. Para keys secretas con scope chico, va a nivel Project (más aislado, menos blast radius si después hay más proyectos en el team).
- `GEMINI_API_KEY` sin prefijo `NEXT_PUBLIC_` = solo accesible del lado servidor. Nunca se inyecta al bundle del cliente. Por eso "Sensitive" en Vercel ESTA VEZ sí va tildado (a diferencia de las vars `NEXT_PUBLIC_*` del Ladrillo 2).
- Next.js 15+ por defecto limita Server Actions a 1 MB de body. Para uploads de imagen hay que subirlo en `next.config.ts` → `experimental.serverActions.bodySizeLimit`. Tope de Vercel free tier: 4.5 MB, conviene quedarse en 4 MB.
- Gemini soporta `responseSchema` (JSON Schema simplificado) — más confiable que sólo pedirlo en el prompt. Sale JSON válido garantizado.
- `useActionState` (no `useFormState`, que está deprecado) es el hook actual para Server Actions con estado en Client Components.

**Próximos ladrillos pendientes (sin orden definitivo, decidir al iniciar próxima sesión):**

- **Catálogo real**: cargar el Excel de 1.854 artículos exportado de GCI (esperando que Vale lo pase). Necesita script que lee `.xlsx` y hace bulk insert a Supabase.
- **Matching contra catálogo**: por cada línea extraída por Gemini, encontrar el mejor candidato en `articulos` (algoritmo de similitud). Ídem para `proveedores`. Reaprovechar lógica del prototipo (`bestArt`, `matchProv`).
- **Edición manual de líneas**: el usuario debe poder corregir/aceptar lo que Gemini extrajo antes de generar el Excel.
- **Tablas `facturas` y `lineas_factura`** con RLS para guardar lo procesado.
- **Generación del Excel GCI**: armar el `.xlsx` con el formato exacto que espera el ERP.
- **Sumar a Valeria** al sistema como usuaria.

Relacionado: [[project-overview]], [[project-business-model]], [[project-ladrillo2-progress]], [[project-db-design]], [[reference-accounts]].
