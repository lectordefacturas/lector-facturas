import * as XLSX from "xlsx";
import { resolve } from "node:path";

const filePath = resolve(
  process.cwd(),
  "prototipo-original",
  "ArCA01-4783.xlsx"
);

const wb = XLSX.readFile(filePath);
const ws = wb.Sheets[wb.SheetNames[0]];

const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, {
  header: 1,
  defval: "",
});

console.log("Total filas en sheet:", rows.length);
console.log();

console.log("=== Primeras 6 filas (raw) ===");
rows.slice(0, 6).forEach((r, i) => console.log(`fila ${i + 1}:`, r));
console.log();

const headerRow = rows[3];
console.log("=== Fila 4 (cabeceras esperadas) ===");
console.log(headerRow);
console.log();

const dataRows = rows.slice(4).filter((r) => r.some((c) => c !== ""));
console.log("=== Datos ===");
console.log("Filas con datos:", dataRows.length);
console.log();

console.log("=== Muestras variadas (10 filas espaciadas) ===");
const step = Math.floor(dataRows.length / 10);
for (let i = 0; i < dataRows.length; i += step) {
  console.log(dataRows[i]);
}
console.log();

console.log("=== Unidades únicas (Columna B) ===");
const unidades = new Map<string, number>();
dataRows.forEach((r) => {
  const u = String(r[1] ?? "").trim();
  unidades.set(u, (unidades.get(u) ?? 0) + 1);
});
[...unidades.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([u, n]) => console.log(`  ${u || "(vacío)"}: ${n}`));
console.log();

console.log("=== Verificación: ¿columna A == columna C siempre? ===");
let coinciden = 0;
let difieren = 0;
const ejemplosDif: (string | number)[][] = [];
dataRows.forEach((r) => {
  const a = String(r[0] ?? "").trim();
  const c = String(r[2] ?? "").trim();
  if (a === c) coinciden++;
  else {
    difieren++;
    if (ejemplosDif.length < 5) ejemplosDif.push(r);
  }
});
console.log(`  coinciden: ${coinciden}`);
console.log(`  difieren: ${difieren}`);
if (ejemplosDif.length) {
  console.log("  ejemplos donde difieren:");
  ejemplosDif.forEach((r) => console.log("   ", r));
}
