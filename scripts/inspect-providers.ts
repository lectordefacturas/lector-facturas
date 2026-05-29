import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve(process.cwd(), "prototipo-original", "gci_datos.js");
const contenido = readFileSync(path, "utf-8");

function extraer(nombre: string) {
  const re = new RegExp(`const ${nombre}\\s*=\\s*(\\[[^;]+\\]);`);
  const m = contenido.match(re);
  if (!m) return null;
  return JSON.parse(m[1]) as { c: string; n: string; u?: string }[];
}

function extraerSet(nombre: string) {
  const re = new RegExp(`const ${nombre}\\s*=\\s*new Set\\((\\[[^\\]]+\\])\\);`);
  const m = contenido.match(re);
  if (!m) return new Set<string>();
  return new Set(JSON.parse(m[1]) as string[]);
}

const articulos = extraer("ARTICULOS");
const fruver = extraer("FRUVER");
const proveedores = extraer("PROVEEDORES");
const proveedoresFruver = extraerSet("PROVEEDORES_FRUVER");

console.log("=== Conteos ===");
console.log("ARTICULOS:           ", articulos?.length ?? "no se encontró");
console.log("FRUVER:              ", fruver?.length ?? "no se encontró");
console.log("PROVEEDORES:         ", proveedores?.length ?? "no se encontró");
console.log("PROVEEDORES_FRUVER:  ", proveedoresFruver.size);
console.log();

if (proveedores) {
  console.log("=== Primeros 10 proveedores ===");
  proveedores.slice(0, 10).forEach((p) => console.log(`  ${p.c}  ${p.n}`));
  console.log();

  console.log("=== Proveedores marcados como FRUVER ===");
  for (const c of proveedoresFruver) {
    const p = proveedores.find((x) => x.c === c);
    console.log(`  ${c}  ${p?.n ?? "(no encontrado)"}`);
  }
}
