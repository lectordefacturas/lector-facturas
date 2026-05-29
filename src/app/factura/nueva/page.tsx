import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NuevaFacturaEditor } from "./editor";
import type { ArticuloCatalogo } from "@/lib/catalog-match";

export type ProveedorCatalogo = {
  id: string;
  codigo_gci: string;
  nombre: string;
  es_fruver: boolean;
};

export default async function NuevaFacturaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: hoteles } = await supabase
    .from("hoteles")
    .select("nombre")
    .limit(1);
  const hotelNombre = hoteles?.[0]?.nombre ?? "";

  // Traemos catálogo y proveedores acá para que el cliente los tenga
  // disponibles para los autocompletes sin re-fetch en cada interacción.
  const [{ count: totalArticulos }, { count: totalProveedores }] =
    await Promise.all([
      supabase
        .from("articulos")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("proveedores")
        .select("*", { count: "exact", head: true }),
    ]);

  const [{ data: articulosRaw }, { data: proveedoresRaw }] = await Promise.all([
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

  const articulos = (articulosRaw ?? []) as ArticuloCatalogo[];
  const proveedores = (proveedoresRaw ?? []) as ProveedorCatalogo[];

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
            <Link
              href="/facturas"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              · Mis facturas
            </Link>
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Importación de Facturas de Compra
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {totalArticulos ?? articulos.length} artículos
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {totalProveedores ?? proveedores.length} proveedores
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
        />
      </div>
    </main>
  );
}
