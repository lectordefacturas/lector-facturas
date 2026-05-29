import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type FacturaConTotal = {
  id: string;
  proveedor_codigo: string | null;
  proveedor_nombre: string;
  nro_factura: string;
  fecha: string | null;
  moneda: string;
  centro_costo: string;
  estado: string;
  creado_en: string;
  total_calculado: number;
  cantidad_lineas: number;
};

export default async function FacturasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: facturas, error } = await supabase
    .from("facturas")
    .select(
      "id, proveedor_codigo, proveedor_nombre, nro_factura, fecha, moneda, centro_costo, estado, creado_en, lineas_factura(cantidad, precio_unitario)"
    )
    .order("creado_en", { ascending: false });

  const rows: FacturaConTotal[] = (facturas ?? []).map((f) => {
    const lineas = (f.lineas_factura ?? []) as {
      cantidad: number | null;
      precio_unitario: number | null;
    }[];
    const total = lineas.reduce(
      (acc, l) => acc + (l.cantidad ?? 0) * (l.precio_unitario ?? 0),
      0
    );
    return {
      id: f.id,
      proveedor_codigo: f.proveedor_codigo,
      proveedor_nombre: f.proveedor_nombre,
      nro_factura: f.nro_factura,
      fecha: f.fecha,
      moneda: f.moneda,
      centro_costo: f.centro_costo,
      estado: f.estado,
      creado_en: f.creado_en,
      total_calculado: total,
      cantidad_lineas: lineas.length,
    };
  });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <Link
              href="/"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              ← Catálogo
            </Link>
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Facturas procesadas
            </span>
          </div>
          <Link
            href="/factura/nueva"
            className="text-sm bg-blue-700 text-white px-3 py-1.5 rounded hover:opacity-90"
          >
            + Nueva factura
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {error ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
            Error al cargar facturas: {error.message}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              Todavía no procesaste ninguna factura.
            </p>
            <Link
              href="/factura/nueva"
              className="inline-block mt-3 text-sm bg-blue-700 text-white px-4 py-2 rounded hover:opacity-90"
            >
              Procesar primera factura →
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                  <th className="py-2 px-3 font-medium">Cuándo</th>
                  <th className="py-2 px-3 font-medium">Proveedor</th>
                  <th className="py-2 px-3 font-medium">Nº Factura</th>
                  <th className="py-2 px-3 font-medium">Fecha</th>
                  <th className="py-2 px-3 font-medium">CC</th>
                  <th className="py-2 px-3 font-medium text-right">Líneas</th>
                  <th className="py-2 px-3 font-medium text-right">Total</th>
                  <th className="py-2 px-3 font-medium">Estado</th>
                  <th className="py-2 px-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {rows.map((f) => (
                  <tr key={f.id}>
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300 text-xs">
                      {new Date(f.creado_en).toLocaleString("es-UY", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-2 px-3 text-zinc-900 dark:text-zinc-100">
                      {f.proveedor_codigo && (
                        <span className="text-zinc-500 text-xs mr-1">
                          {f.proveedor_codigo}
                        </span>
                      )}
                      {f.proveedor_nombre}
                    </td>
                    <td className="py-2 px-3 text-zinc-900 dark:text-zinc-100">
                      {f.nro_factura}
                    </td>
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">
                      {f.fecha
                        ? new Date(f.fecha).toLocaleDateString("es-UY")
                        : "—"}
                    </td>
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">
                      {f.centro_costo}
                    </td>
                    <td className="py-2 px-3 text-right text-zinc-700 dark:text-zinc-300">
                      {f.cantidad_lineas}
                    </td>
                    <td className="py-2 px-3 text-right text-zinc-900 dark:text-zinc-100">
                      {f.moneda} {f.total_calculado.toLocaleString("es-UY")}
                    </td>
                    <td className="py-2 px-3">
                      {f.estado === "final" ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">
                          final
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">
                          borrador
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <Link
                        href={`/factura/${f.id}`}
                        className="text-blue-700 dark:text-blue-400 hover:underline text-xs"
                      >
                        Abrir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
