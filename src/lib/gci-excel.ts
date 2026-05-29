import * as XLSX from "xlsx";
import type { LineaConMatch } from "@/app/factura/nueva/actions";

export type CabeceraGCI = {
  proveedor_nombre: string;
  nro_factura: string;
  moneda: string;
};

export type GenerarExcelInput = {
  cabecera: CabeceraGCI;
  lineas: LineaConMatch[];
  centro_costo: string;
  empresa: string;
};

/**
 * Genera el Excel con el formato exacto que pide GCI para importar facturas.
 * Reaprovecha la estructura del prototipo de Vale (GCI_Dashboard.html).
 *
 * Columnas de líneas:
 *   1. Código Artículo (del catálogo, vacío si no hubo match)
 *   2. Nombre Artículo (del catálogo si hubo match, sino de Gemini)
 *   3. Cantidad
 *   4. UM Cantidad
 *   5. Cantidad Bonificada (vacío)
 *   6. Precio
 *   7. UM Precio
 *   8. Centro de costo
 *   9. Comentario (vacío)
 */
export function generarExcelGCI(input: GenerarExcelInput): Buffer {
  const { cabecera, lineas, centro_costo, empresa } = input;

  const proveedorLabel = cabecera.proveedor_nombre || "";
  const filasLineas = lineas.map((l) => {
    const codigo = l.match?.articulo.codigo_gci ?? "";
    const nombre = l.match?.articulo.nombre ?? l.descripcion;
    const unidad = l.match?.articulo.unidad ?? "";
    return [
      codigo,
      nombre,
      l.cantidad || "",
      unidad,
      "", // Cantidad Bonificada
      l.precio_unitario || "",
      unidad,
      centro_costo,
      "", // Comentario
    ];
  });

  const data: (string | number)[][] = [
    ["Importación de Líneas de Transacción"],
    [],
    ["Tipo Transacción:", "FC002", "Factura de compra directa"],
    ["Empresa:", empresa],
    ["Moneda", cabecera.moneda || "UYU"],
    ["Proveedor", proveedorLabel],
    ["Factura del proveedor", cabecera.nro_factura || ""],
    [],
    [],
    [],
    [],
    [
      "Código Artículo",
      "Nombre Artículo",
      "Cantidad",
      "UM Cantidad",
      "Cantidad Bonificada",
      "Precio",
      "UM Precio",
      "Centro de costo",
      "Comentario",
    ],
    [
      "Requerido.\nTexto 30 Caracteres.",
      "Opcional.\nTexto 50 Caracteres.",
      "Opcional si hay cantidad bonificada.\nNumérico con 3 decimales.",
      "Requerido.\nTexto 5 Caracteres.",
      "Opcional si hay cantidad.\nNumérico con 3 decimales.",
      "Opcional.\nNumérico con 2 decimales.",
      "Requerido si se ingresa precio.\nTexto 5 Caracteres.",
      "Requerido.\nTexto 16 Caracteres.",
      "Opcional.\nTexto.",
    ],
    ...filasLineas,
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [
    { wch: 18 },
    { wch: 32 },
    { wch: 12 },
    { wch: 10 },
    { wch: 16 },
    { wch: 12 },
    { wch: 10 },
    { wch: 18 },
    { wch: 22 },
  ];

  // Forzar columnas A, D y H como texto (códigos, no números) — replica el prototipo.
  filasLineas.forEach((_, i) => {
    ["A", "D", "H"].forEach((c) => {
      const ref = c + (13 + i);
      const cell = ws[ref];
      if (cell) cell.t = "s";
    });
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Importar en GCI");

  const arrayBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return arrayBuffer as Buffer;
}

export function nombreArchivoGCI(nroFactura: string): string {
  const safeNro = (nroFactura || "sin_nro").replace(/[\s/\\:]/g, "_");
  const fecha = new Date().toISOString().slice(0, 10);
  return `GCI_FC_${safeNro}_${fecha}.xlsx`;
}
