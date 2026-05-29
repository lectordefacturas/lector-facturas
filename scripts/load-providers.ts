/**
 * Carga los 334 proveedores reales de Cala di Volpe a Supabase.
 * Fuente: prototipo-original/gci_datos.js (mismo archivo que usaba Vale).
 *
 * Para correr: `npx tsx scripts/load-providers.ts`
 */
import { config } from "dotenv";
import { resolve } from "node:path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const USER_EMAIL = "prueba@cala-di-volpe.test";
const USER_PASSWORD = "prueba123";
const HOTEL_SLUG = "cala-di-volpe";

const GCI_DATOS_PATH = resolve(
  process.cwd(),
  "prototipo-original",
  "gci_datos.js"
);

type ProveedorRaw = { c: string; n: string };

function extraerProveedores(): {
  proveedores: ProveedorRaw[];
  fruverSet: Set<string>;
} {
  const contenido = readFileSync(GCI_DATOS_PATH, "utf-8");

  const matchProv = contenido.match(/const PROVEEDORES\s*=\s*(\[[^;]+\]);/);
  if (!matchProv) throw new Error("No se encontró PROVEEDORES en gci_datos.js");
  const proveedores = JSON.parse(matchProv[1]) as ProveedorRaw[];

  const matchFruver = contenido.match(
    /const PROVEEDORES_FRUVER\s*=\s*new Set\((\[[^\]]+\])\);/
  );
  const fruverArr = matchFruver
    ? (JSON.parse(matchFruver[1]) as string[])
    : [];
  const fruverSet = new Set(fruverArr);

  return { proveedores, fruverSet };
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

  console.log("→ Buscando hotel_id…");
  const { data: hotel, error: hotelError } = await supabase
    .from("hoteles")
    .select("id, nombre")
    .eq("slug", HOTEL_SLUG)
    .single();
  if (hotelError) throw hotelError;
  console.log(`  hotel_id = ${hotel.id} (${hotel.nombre})`);

  console.log("→ Extrayendo proveedores del prototipo…");
  const { proveedores, fruverSet } = extraerProveedores();
  console.log(`  ${proveedores.length} proveedores, ${fruverSet.size} fruver`);

  console.log("→ Borrando proveedores TEST existentes…");
  const { error: delError, count: borrados } = await supabase
    .from("proveedores")
    .delete({ count: "exact" })
    .eq("hotel_id", hotel.id)
    .like("codigo_gci", "TEST%");
  if (delError) throw delError;
  console.log(`  ${borrados ?? 0} TEST borrados`);

  console.log("→ Insertando en lotes de 500…");
  const batchSize = 500;
  let totalInsertados = 0;
  for (let i = 0; i < proveedores.length; i += batchSize) {
    const batch = proveedores.slice(i, i + batchSize).map((p) => ({
      hotel_id: hotel.id,
      codigo_gci: p.c,
      nombre: p.n,
      es_fruver: fruverSet.has(p.c),
    }));
    const { error: insError, count } = await supabase
      .from("proveedores")
      .insert(batch, { count: "exact" });
    if (insError) {
      console.error("Error en batch", i, insError);
      throw insError;
    }
    totalInsertados += count ?? batch.length;
    console.log(`  lote ${i / batchSize + 1}: +${count ?? batch.length}`);
  }

  console.log("→ Verificando totales…");
  const { count: total } = await supabase
    .from("proveedores")
    .select("*", { count: "exact", head: true })
    .eq("hotel_id", hotel.id);
  const { count: totalFruver } = await supabase
    .from("proveedores")
    .select("*", { count: "exact", head: true })
    .eq("hotel_id", hotel.id)
    .eq("es_fruver", true);

  console.log();
  console.log("=== Resumen ===");
  console.log(`  Insertados:           ${totalInsertados}`);
  console.log(`  Total en DB ahora:    ${total}`);
  console.log(`  De los cuales fruver: ${totalFruver}`);
  console.log("Listo ✓");
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
