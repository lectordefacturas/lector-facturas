"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  procesarFactura,
  type ProcesarFacturaResult,
} from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-black dark:bg-white text-white dark:text-black rounded py-2 font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Procesando con Gemini..." : "Subir y leer factura"}
    </button>
  );
}

function ConfianzaBadge({ valor }: { valor: number }) {
  let cls = "bg-zinc-200 text-zinc-700";
  if (valor >= 80) cls = "bg-green-100 text-green-800";
  else if (valor >= 60) cls = "bg-yellow-100 text-yellow-800";
  else cls = "bg-red-100 text-red-800";
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-xs ${cls}`}>
      {valor}%
    </span>
  );
}

type DescargaState =
  | { status: "idle" }
  | { status: "downloading" }
  | { status: "error"; mensaje: string };

function BotonDescargarExcel({
  state,
}: {
  state: Extract<ProcesarFacturaResult, { ok: true }>;
}) {
  const [descarga, setDescarga] = useState<DescargaState>({ status: "idle" });

  async function onDescargar() {
    setDescarga({ status: "downloading" });
    try {
      const res = await fetch("/api/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cabecera: state.cabecera,
          lineas: state.lineas,
          centro_costo: state.centro_costo,
          empresa: state.hotel_nombre,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match ? match[1] : "factura.xlsx";

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
      setDescarga({ status: "error", mensaje: msg });
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onDescargar}
        disabled={descarga.status === "downloading"}
        className="w-full bg-green-700 text-white rounded py-2 font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {descarga.status === "downloading"
          ? "Generando Excel..."
          : "Descargar Excel para GCI"}
      </button>
      {descarga.status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {descarga.mensaje}
        </p>
      )}
    </div>
  );
}

export function NuevaFacturaForm() {
  const [state, formAction] = useActionState<
    ProcesarFacturaResult | null,
    FormData
  >(procesarFactura, null);

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4"
      >
        <div>
          <label
            htmlFor="factura"
            className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Imagen de la factura (JPG o PNG, máx 4 MB){" "}
            <span className="text-red-600">*</span>
          </label>
          <input
            id="factura"
            name="factura"
            type="file"
            accept="image/jpeg,image/png"
            required
            className="block w-full text-sm text-zinc-900 dark:text-zinc-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-zinc-200 file:text-zinc-900 dark:file:bg-zinc-800 dark:file:text-zinc-100 hover:file:opacity-90"
          />
        </div>

        <div>
          <label
            htmlFor="centro_costo"
            className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Centro de costo <span className="text-red-600">*</span>
            <span className="text-zinc-500 font-normal">
              {" "}
              (máx 16 caracteres)
            </span>
          </label>
          <input
            id="centro_costo"
            name="centro_costo"
            type="text"
            required
            maxLength={16}
            placeholder="ej. COMPRAS"
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <SubmitButton />
      </form>

      {state?.ok === false && (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-4">
          <p className="font-medium text-red-900 dark:text-red-200">Error</p>
          <pre className="text-sm text-red-800 dark:text-red-300 mt-2 whitespace-pre-wrap break-all">
            {state.error}
          </pre>
        </div>
      )}

      {state?.ok === true && (
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              Cabecera
            </h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-zinc-500">Proveedor</dt>
              <dd className="text-zinc-900 dark:text-zinc-100">
                {state.cabecera.proveedor_nombre || "—"}
              </dd>
              <dt className="text-zinc-500">N° factura</dt>
              <dd className="text-zinc-900 dark:text-zinc-100">
                {state.cabecera.nro_factura || "—"}
              </dd>
              <dt className="text-zinc-500">Fecha</dt>
              <dd className="text-zinc-900 dark:text-zinc-100">
                {state.cabecera.fecha || "—"}
              </dd>
              <dt className="text-zinc-500">Moneda</dt>
              <dd className="text-zinc-900 dark:text-zinc-100">
                {state.cabecera.moneda || "—"}
              </dd>
              <dt className="text-zinc-500">Centro de costo</dt>
              <dd className="text-zinc-900 dark:text-zinc-100">
                {state.centro_costo}
              </dd>
            </dl>
          </div>

          <div className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 overflow-x-auto">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              Líneas detectadas ({state.lineas.length})
            </h2>
            {state.lineas.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Gemini no detectó líneas en la imagen.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="py-2 font-medium">Descripción</th>
                    <th className="py-2 font-medium">Match catálogo</th>
                    <th className="py-2 font-medium text-right">Cant.</th>
                    <th className="py-2 font-medium text-right">P. unit.</th>
                    <th className="py-2 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {state.lineas.map((l, i) => (
                    <tr key={i} className="align-top">
                      <td className="py-2 text-zinc-900 dark:text-zinc-100 pr-3">
                        {l.descripcion}
                      </td>
                      <td className="py-2 text-zinc-900 dark:text-zinc-100 pr-3">
                        {l.match ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 text-xs">
                                {l.match.articulo.codigo_gci}
                              </span>
                              <ConfianzaBadge valor={l.match.confianza} />
                            </div>
                            <div>{l.match.articulo.nombre}</div>
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">
                            sin match
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-right text-zinc-900 dark:text-zinc-100">
                        {l.cantidad}
                      </td>
                      <td className="py-2 text-right text-zinc-900 dark:text-zinc-100">
                        {l.precio_unitario.toLocaleString("es-UY")}
                      </td>
                      <td className="py-2 text-right text-zinc-900 dark:text-zinc-100">
                        {(l.cantidad * l.precio_unitario).toLocaleString(
                          "es-UY"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <BotonDescargarExcel state={state} />
        </div>
      )}
    </div>
  );
}
