import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NuevaFacturaEditor } from "../nueva/editor";
import type { ArticuloCatalogo } from "@/lib/catalog-match";
import type { ProveedorCatalogo } from "../nueva/page";

export default async function EditarFacturaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [{ data: factura, error: facturaError }, { data: lineas }] =
    await Promise.all([
      supabase.from("facturas").select("*").eq("id", id).single(),
      supabase
        .from("lineas_factura")
        .select("*")
        .eq("factura_id", id)
        .order("nro_linea"),
    ]);

  if (facturaError || !factura) {
    notFound();
  }

  const [{ data: hoteles }, { data: articulosRaw }, { data: proveedoresRaw }] =
    await Promise.all([
      supabase.from("hoteles").select("nombre").limit(1),
      supabase
        .from("articulos")
        .select("id, codigo_gci, nombre, unidad, es_fruver")
        .order("nombre")
        .range(0, 9999),
      supabase
        .from("proveedores")
        .select("id, codigo_gci, nombre, es_fruver")
        .order("nombre")
        .range(0, 9999),
    ]);

  const hotelNombre = hoteles?.[0]?.nombre ?? "";
  const articulos = (articulosRaw ?? []) as ArticuloCatalogo[];
  const proveedores = (proveedoresRaw ?? []) as ProveedorCatalogo[];

  const facturaInicial = {
    id: factura.id,
    cabecera: {
      proveedor_nombre: factura.proveedor_nombre ?? "",
      proveedor_codigo: factura.proveedor_codigo ?? "",
      nro_factura: factura.nro_factura ?? "",
      fecha: factura.fecha ?? "",
      moneda: factura.moneda ?? "UYU",
      centro_costo: factura.centro_costo ?? "",
    },
    lineas: (lineas ?? []).map((l) => ({
      articulo_nombre: l.articulo_nombre ?? "",
      codigo_gci: l.articulo_codigo_gci ?? "",
      um_cantidad: l.um_cantidad ?? "",
      cantidad: (l.cantidad ?? "") as number | "",
      cantidad_bonificada: (l.cantidad_bonificada ?? "") as number | "",
      precio_unitario: (l.precio_unitario ?? "") as number | "",
      um_precio: l.um_precio ?? "",
      centro_costo_linea: l.centro_costo_linea ?? "",
      comentario: l.comentario ?? "",
    })),
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <Link
              href="/facturas"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              ← Facturas
            </Link>
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Editar factura
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                factura.estado === "final"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {factura.estado}
            </span>
          </div>
          <div className="text-xs text-zinc-500">
            {hotelNombre || "Sin hotel"} · FC002
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <NuevaFacturaEditor
          articulos={articulos}
          proveedores={proveedores}
          hotelNombre={hotelNombre}
          facturaInicial={facturaInicial}
        />
      </div>
    </main>
  );
}
