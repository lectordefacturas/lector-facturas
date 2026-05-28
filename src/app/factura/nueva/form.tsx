"use client";

import { useActionState } from "react";
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
            Imagen de la factura (JPG o PNG, máx 4 MB)
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
                {state.factura.proveedor_nombre || "—"}
              </dd>
              <dt className="text-zinc-500">N° factura</dt>
              <dd className="text-zinc-900 dark:text-zinc-100">
                {state.factura.nro_factura || "—"}
              </dd>
              <dt className="text-zinc-500">Fecha</dt>
              <dd className="text-zinc-900 dark:text-zinc-100">
                {state.factura.fecha || "—"}
              </dd>
              <dt className="text-zinc-500">Moneda</dt>
              <dd className="text-zinc-900 dark:text-zinc-100">
                {state.factura.moneda || "—"}
              </dd>
            </dl>
          </div>

          <div className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              Líneas detectadas ({state.factura.lineas.length})
            </h2>
            {state.factura.lineas.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Gemini no detectó líneas en la imagen.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="py-2 font-medium">Descripción</th>
                    <th className="py-2 font-medium text-right">Cant.</th>
                    <th className="py-2 font-medium text-right">P. unit.</th>
                    <th className="py-2 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {state.factura.lineas.map((l, i) => (
                    <tr key={i}>
                      <td className="py-2 text-zinc-900 dark:text-zinc-100">
                        {l.descripcion}
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
        </div>
      )}
    </div>
  );
}
