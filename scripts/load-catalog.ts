/**
 * Carga el catálogo real de Cala di Volpe a Supabase.
 *
 * - Lee el .xlsx exportado de GCI (ArCA01-4783.xlsx).
 * - Mapea a la tabla `articulos`.
 * - Marca es_fruver=true para los códigos que estaban en gci_datos.js (FRUVER).
 * - Borra los 5 artículos TEST seed antes de cargar.
 * - Usa el usuario admin del hotel para respetar RLS (no usa service_role).
 *
 * Para correr: `npx tsx scripts/load-catalog.ts`
 */
import { config } from "dotenv";
import { resolve } from "node:path";
config({ path: resolve(process.cwd(), ".env.local") });

import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const USER_EMAIL = "prueba@cala-di-volpe.test";
const USER_PASSWORD = "prueba123";
const HOTEL_SLUG = "cala-di-volpe";

const XLSX_PATH = resolve(
  process.cwd(),
  "prototipo-original",
  "ArCA01-4783.xlsx"
);
const GCI_DATOS_PATH = resolve(
  process.cwd(),
  "prototipo-original",
  "gci_datos.js"
);

function extraerCodigosFruver(): Set<string> {
  const contenido = readFileSync(GCI_DATOS_PATH, "utf-8");
  const match = contenido.match(/const FRUVER\s*=\s*(\[[^;]+\]);/);
  if (!match) throw new Error("No se encontró FRUVER en gci_datos.js");
  const fruverArr = JSON.parse(match[1]) as { c: string }[];
  return new Set(fruverArr.map((a) => a.c));
}

type FilaCatalogo = {
  codigo_gci: string;
  nombre: string;
  unidad: string;
  es_fruver: boolean;
};

function leerExcel(setFruver: Set<string>): FilaCatalogo[] {
  const wb = XLSX.readFile(XLSX_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, {
    header: 1,
    defval: "",
  });

  // Saltar las primeras 6 filas (metadata + cabecera). Los datos arrancan en la 7.
  const dataRows = rows.slice(6);

  const resultado: FilaCatalogo[] = [];
  for (const r of dataRows) {
    const codigo = String(r[2] ?? "").trim();
    const nombre = String(r[3] ?? "").trim();
    let unidad = String(r[1] ?? "").trim();

    if (!codigo || !nombre) continue;
    // Saltar filas raras que podrían colarse (ej: la fila "Unidad" suelta)
    if (codigo === "Artículo" || nombre === "Nombre") continue;

    if (unidad === "(Ninguna)" || unidad === "Unidad") unidad = "";

    resultado.push({
      codigo_gci: codigo,
      nombre,
      unidad,
      es_fruver: setFruver.has(codigo),
    });
  }
  return resultado;
}

async function main() {
  console.log("→ Conectando a Supabase…");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log(`→ Logueando como ${USER_EMAIL}…`);
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: USER_EMAIL,
    password: USER_PASSWORD,
  });
  if (authError) throw authError;

  console.log("→ Buscando hotel_id de Cala di Volpe…");
  const { data: hotel, error: hotelError } = await supabase
    .from("hoteles")
    .select("id, nombre")
    .eq("slug", HOTEL_SLUG)
    .single();
  if (hotelError) throw hotelError;
  console.log(`  hotel_id = ${hotel.id} (${hotel.nombre})`);

  console.log("→ Extrayendo códigos FRUVER del prototipo…");
  const setFruver = extraerCodigosFruver();
  console.log(`  ${setFruver.size} códigos fruver encontrados`);

  console.log("→ Leyendo Excel…");
  const filas = leerExcel(setFruver);
  console.log(`  ${filas.length} filas válidas`);

  console.log("→ Borrando artículos TEST existentes…");
  const { error: delError, count: borrados } = await supabase
    .from("articulos")
    .delete({ count: "exact" })
    .eq("hotel_id", hotel.id)
    .like("codigo_gci", "TEST%");
  if (delError) throw delError;
  console.log(`  ${borrados ?? 0} artículos TEST borrados`);

  console.log("→ Insertando en lotes de 500…");
  const batchSize = 500;
  let insertados = 0;
  for (let i = 0; i < filas.length; i += batchSize) {
    const batch = filas.slice(i, i + batchSize).map((f) => ({
      hotel_id: hotel.id,
      codigo_gci: f.codigo_gci,
      nombre: f.nombre,
      unidad: f.unidad,
      es_fruver: f.es_fruver,
    }));
    const { error: insError, count } = await supabase
      .from("articulos")
      .insert(batch, { count: "exact" });
    if (insError) {
      console.error("Error en batch", i, insError);
      throw insError;
    }
    insertados += count ?? batch.length;
    console.log(`  lote ${i / batchSize + 1}: +${count ?? batch.length}`);
  }

  console.log("→ Verificando totales…");
  const { count: total } = await supabase
    .from("articulos")
    .select("*", { count: "exact", head: true })
    .eq("hotel_id", hotel.id);
  const { count: totalFruver } = await supabase
    .from("articulos")
    .select("*", { count: "exact", head: true })
    .eq("hotel_id", hotel.id)
    .eq("es_fruver", true);

  console.log();
  console.log("=== Resumen ===");
  console.log(`  Insertados:           ${insertados}`);
  console.log(`  Total en DB ahora:    ${total}`);
  console.log(`  De los cuales fruver: ${totalFruver}`);
  console.log("Listo ✓");
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
