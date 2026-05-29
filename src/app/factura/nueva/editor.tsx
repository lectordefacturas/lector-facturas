"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Autocomplete } from "./autocomplete";
import {
  procesarFactura,
  type ProcesarFacturaResult,
} from "./actions";
import type { ArticuloCatalogo } from "@/lib/catalog-match";
import type { ProveedorCatalogo } from "./page";

type Linea = {
  /** Texto libre o nombre del artículo del catálogo */
  articulo_nombre: string;
  codigo_gci: string;
  um_cantidad: string;
  cantidad: number | "";
  cantidad_bonificada: number | "";
  precio_unitario: number | "";
  um_precio: string;
  centro_costo_linea: string;
  comentario: string;
};

type Cabecera = {
  proveedor_nombre: string;
  proveedor_codigo: string;
  nro_factura: string;
  fecha: string;
  moneda: string;
  centro_costo: string;
};

const FILA_VACIA: Linea = {
  articulo_nombre: "",
  codigo_gci: "",
  um_cantidad: "",
  cantidad: "",
  cantidad_bonificada: "",
  precio_unitario: "",
  um_precio: "",
  centro_costo_linea: "",
  comentario: "",
};

const MONEDAS = [
  { code: "UYU", label: "UYU — Pesos" },
  { code: "USD", label: "USD — Dólares" },
  { code: "EUR", label: "EUR — Euros" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-violet-600 text-white rounded py-2 font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Procesando con IA..." : "Leer factura"}
    </button>
  );
}

export function NuevaFacturaEditor({
  articulos,
  proveedores,
  hotelNombre,
}: {
  articulos: ArticuloCatalogo[];
  proveedores: ProveedorCatalogo[];
  hotelNombre: string;
}) {
  const [actionState, formAction] = useActionState<
    ProcesarFacturaResult | null,
    FormData
  >(procesarFactura, null);

  const [lastSyncRef, setLastSync] = useState<ProcesarFacturaResult | null>(
    null
  );

  const [cabecera, setCabecera] = useState<Cabecera>({
    proveedor_nombre: "",
    proveedor_codigo: "",
    nro_factura: "",
    fecha: "",
    moneda: "UYU",
    centro_costo: "",
  });

  const [lineas, setLineas] = useState<Linea[]>([
    { ...FILA_VACIA },
    { ...FILA_VACIA },
    { ...FILA_VACIA },
  ]);

  const [descarga, setDescarga] = useState<{
    status: "idle" | "downloading";
    error?: string;
  }>({ status: "idle" });

  // Cuando la action devuelve un resultado nuevo y exitoso, sincronizamos al form.
  useEffect(() => {
    if (
      actionState &&
      actionState !== lastSyncRef &&
      actionState.ok === true
    ) {
      setCabecera((prev) => ({
        ...prev,
        proveedor_nombre: actionState.cabecera.proveedor_nombre,
        nro_factura: actionState.cabecera.nro_factura,
        fecha: parseFecha(actionState.cabecera.fecha) || prev.fecha,
        moneda: actionState.cabecera.moneda || prev.moneda || "UYU",
      }));
      setLineas(
        actionState.lineas.map((l) => ({
          articulo_nombre: l.match?.articulo.nombre ?? l.descripcion ?? "",
          codigo_gci: l.match?.articulo.codigo_gci ?? "",
          um_cantidad: l.match?.articulo.unidad ?? "",
          cantidad: l.cantidad ?? "",
          cantidad_bonificada: "",
          precio_unitario: l.precio_unitario ?? "",
          um_precio: l.match?.articulo.unidad ?? "",
          centro_costo_linea: "",
          comentario: "",
        }))
      );
      setLastSync(actionState);
    }
  }, [actionState, lastSyncRef]);

  function actualizarLinea(i: number, patch: Partial<Linea>) {
    setLineas((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], ...patch };
      return copy;
    });
  }

  function agregarLinea() {
    setLineas((prev) => [...prev, { ...FILA_VACIA }]);
  }

  function quitarLinea(i: number) {
    setLineas((prev) => prev.filter((_, idx) => idx !== i));
  }

  function limpiar() {
    setCabecera({
      proveedor_nombre: "",
      proveedor_codigo: "",
      nro_factura: "",
      fecha: "",
      moneda: "UYU",
      centro_costo: "",
    });
    setLineas([{ ...FILA_VACIA }, { ...FILA_VACIA }, { ...FILA_VACIA }]);
  }

  async function descargarExcel() {
    if (!cabecera.centro_costo.trim()) {
      setDescarga({
        status: "idle",
        error: "Falta el centro de costo (campo obligatorio).",
      });
      return;
    }
    const lineasValidas = lineas.filter(
      (l) => l.articulo_nombre.trim() || l.codigo_gci.trim()
    );
    if (lineasValidas.length === 0) {
      setDescarga({
        status: "idle",
        error: "No hay líneas para exportar.",
      });
      return;
    }

    setDescarga({ status: "downloading" });
    try {
      const payload = {
        cabecera: {
          proveedor_nombre: cabecera.proveedor_codigo
            ? `${cabecera.proveedor_codigo} - ${cabecera.proveedor_nombre}`
            : cabecera.proveedor_nombre,
          nro_factura: cabecera.nro_factura,
          moneda: cabecera.moneda,
        },
        lineas: lineasValidas.map((l) => ({
          descripcion: l.articulo_nombre,
          cantidad: typeof l.cantidad === "number" ? l.cantidad : 0,
          precio_unitario:
            typeof l.precio_unitario === "number" ? l.precio_unitario : 0,
          match: l.codigo_gci
            ? {
                articulo: {
                  id: "",
                  codigo_gci: l.codigo_gci,
                  nombre: l.articulo_nombre,
                  unidad: l.um_cantidad,
                  es_fruver: false,
                },
                confianza: 100,
              }
            : null,
        })),
        centro_costo: cabecera.centro_costo,
        empresa: hotelNombre,
      };

      const res = await fetch("/api/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const m = disposition.match(/filename="(.+)"/);
      const filename = m ? m[1] : "factura.xlsx";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDescarga({ status: "idle" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setDescarga({ status: "idle", error: msg });
    }
  }

  const itemsProveedores = proveedores.map((p) => ({
    label: p.nombre,
    sublabel: `Código ${p.codigo_gci}${p.es_fruver ? " · FRUVER" : ""}`,
    searchText: `${p.nombre} ${p.codigo_gci}`,
    raw: p,
  }));

  const itemsArticulos = articulos.map((a) => ({
    label: a.nombre,
    sublabel: `${a.codigo_gci}${a.unidad ? ` · ${a.unidad}` : ""}${
      a.es_fruver ? " · fruver" : ""
    }`,
    searchText: `${a.nombre} ${a.codigo_gci}`,
    raw: a,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
      {/* Columna izquierda: foto + acciones */}
      <aside className="space-y-4">
        <section className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            📷 FOTO DE LA FACTURA
          </h2>
          <form action={formAction} className="space-y-3">
            <input
              name="factura"
              type="file"
              accept="image/jpeg,image/png"
              required
              className="block w-full text-xs text-zinc-700 dark:text-zinc-300 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-zinc-200 file:text-zinc-900 dark:file:bg-zinc-800 dark:file:text-zinc-100"
            />
            <SubmitButton />
          </form>
          {actionState?.ok === false && (
            <p className="mt-3 text-xs text-red-600 dark:text-red-400 break-words">
              {actionState.error}
            </p>
          )}
        </section>
      </aside>

      {/* Columna derecha: datos editables + líneas */}
      <div className="space-y-4">
        <section className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            📄 DATOS DE LA FACTURA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Proveedor <span className="text-red-600">*</span>
              </label>
              <Autocomplete
                value={cabecera.proveedor_nombre}
                items={itemsProveedores}
                hint="Buscá el proveedor por nombre o código."
                placeholder="Escribí el nombre del proveedor..."
                onChange={(v, raw) => {
                  if (raw) {
                    const p = raw as ProveedorCatalogo;
                    setCabecera((c) => ({
                      ...c,
                      proveedor_nombre: p.nombre,
                      proveedor_codigo: p.codigo_gci,
                    }));
                  } else {
                    setCabecera((c) => ({
                      ...c,
                      proveedor_nombre: v,
                      proveedor_codigo: "",
                    }));
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Nº Factura <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={cabecera.nro_factura}
                onChange={(e) =>
                  setCabecera((c) => ({ ...c, nro_factura: e.target.value }))
                }
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={cabecera.fecha}
                onChange={(e) =>
                  setCabecera((c) => ({ ...c, fecha: e.target.value }))
                }
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Moneda
              </label>
              <select
                value={cabecera.moneda}
                onChange={(e) =>
                  setCabecera((c) => ({ ...c, moneda: e.target.value }))
                }
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100"
              >
                {MONEDAS.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Centro de costo <span className="text-red-600">*</span>{" "}
                <span className="font-normal text-zinc-500">(máx 16)</span>
              </label>
              <input
                type="text"
                value={cabecera.centro_costo}
                onChange={(e) =>
                  setCabecera((c) => ({
                    ...c,
                    centro_costo: e.target.value.slice(0, 16),
                  }))
                }
                placeholder="Ej: 001"
                maxLength={16}
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            🧾 LÍNEAS DE LA FACTURA
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-zinc-600 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="py-1.5 pr-2 w-8">#</th>
                  <th className="py-1.5 pr-2 min-w-[260px]">Artículo</th>
                  <th className="py-1.5 pr-2 w-[110px]">Código GCI</th>
                  <th className="py-1.5 pr-2 w-[70px]">UM</th>
                  <th className="py-1.5 pr-2 w-[90px] text-right">Cantidad</th>
                  <th className="py-1.5 pr-2 w-[90px] text-right">
                    Cant. Bonif.
                  </th>
                  <th className="py-1.5 pr-2 w-[100px] text-right">
                    Precio Unit.
                  </th>
                  <th className="py-1.5 pr-2 w-[70px]">UM Precio</th>
                  <th className="py-1.5 pr-2 w-[100px]">Centro Costo</th>
                  <th className="py-1.5 pr-2 min-w-[120px]">Comentario</th>
                  <th className="py-1.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {lineas.map((l, i) => (
                  <tr
                    key={i}
                    className="border-b border-zinc-100 dark:border-zinc-800 align-top"
                  >
                    <td className="py-1.5 pr-2 text-zinc-500">{i + 1}</td>
                    <td className="py-1.5 pr-2">
                      <Autocomplete
                        value={l.articulo_nombre}
                        items={itemsArticulos}
                        placeholder="Buscar artículo..."
                        onChange={(v, raw) => {
                          if (raw) {
                            const a = raw as ArticuloCatalogo;
                            actualizarLinea(i, {
                              articulo_nombre: a.nombre,
                              codigo_gci: a.codigo_gci,
                              um_cantidad: a.unidad,
                              um_precio: a.unidad,
                            });
                          } else {
                            actualizarLinea(i, { articulo_nombre: v });
                          }
                        }}
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={l.codigo_gci}
                        onChange={(e) =>
                          actualizarLinea(i, { codigo_gci: e.target.value })
                        }
                        className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-1.5 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={l.um_cantidad}
                        onChange={(e) =>
                          actualizarLinea(i, { um_cantidad: e.target.value })
                        }
                        className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-1.5 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        step="0.001"
                        value={l.cantidad}
                        onChange={(e) =>
                          actualizarLinea(i, {
                            cantidad:
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          })
                        }
                        className="w-full text-right rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1.5 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        step="0.001"
                        value={l.cantidad_bonificada}
                        onChange={(e) =>
                          actualizarLinea(i, {
                            cantidad_bonificada:
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          })
                        }
                        className="w-full text-right rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1.5 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        step="0.01"
                        value={l.precio_unitario}
                        onChange={(e) =>
                          actualizarLinea(i, {
                            precio_unitario:
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          })
                        }
                        className="w-full text-right rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1.5 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={l.um_precio}
                        onChange={(e) =>
                          actualizarLinea(i, { um_precio: e.target.value })
                        }
                        className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-1.5 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={l.centro_costo_linea}
                        placeholder={cabecera.centro_costo || "001"}
                        maxLength={16}
                        onChange={(e) =>
                          actualizarLinea(i, {
                            centro_costo_linea: e.target.value,
                          })
                        }
                        className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1.5 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={l.comentario}
                        onChange={(e) =>
                          actualizarLinea(i, { comentario: e.target.value })
                        }
                        className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1.5 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5">
                      <button
                        type="button"
                        onClick={() => quitarLinea(i)}
                        className="text-red-600 hover:text-red-800 px-1"
                        title="Quitar línea"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2 mt-3 items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={agregarLinea}
                className="text-xs bg-sky-600 text-white rounded px-3 py-1.5 hover:opacity-90"
              >
                + Agregar línea
              </button>
              <button
                type="button"
                onClick={limpiar}
                className="text-xs bg-orange-500 text-white rounded px-3 py-1.5 hover:opacity-90"
              >
                Limpiar
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">
                {lineas.length} línea{lineas.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={descargarExcel}
                disabled={descarga.status === "downloading"}
                className="text-sm bg-blue-700 text-white rounded px-4 py-2 font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {descarga.status === "downloading"
                  ? "Generando Excel..."
                  : "↓ Descargar Excel para GCI"}
              </button>
            </div>
          </div>
          {descarga.error && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              {descarga.error}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function parseFecha(input: string): string {
  if (!input) return "";
  // Gemini suele devolver DD/MM/YYYY. Convertimos a YYYY-MM-DD para <input type="date">.
  const m = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return "";
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}
