import Fuse from "fuse.js";

export type ArticuloCatalogo = {
  id: string;
  codigo_gci: string;
  nombre: string;
  unidad: string;
  es_fruver: boolean;
};

export type MatchResult = {
  articulo: ArticuloCatalogo;
  /** Confianza 0-100. 100 = match perfecto. */
  confianza: number;
} | null;

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // acentos
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function crearMatcher(catalogo: ArticuloCatalogo[]) {
  const indexable = catalogo.map((a) => ({
    ...a,
    _normalizado: normalizar(a.nombre),
  }));

  const fuse = new Fuse(indexable, {
    keys: ["_normalizado"],
    threshold: 0.4,
    distance: 200,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
  });

  return function matchArticulo(descripcion: string): MatchResult {
    const q = normalizar(descripcion);
    if (q.length < 2) return null;

    const resultados = fuse.search(q, { limit: 1 });
    if (resultados.length === 0) return null;

    const { item, score } = resultados[0];
    // Fuse devuelve score 0 = perfecto, 1 = peor. Lo invertimos a 0-100.
    const confianza = Math.round((1 - (score ?? 1)) * 100);

    const { _normalizado: _unused, ...articulo } = item;
    void _unused;
    return { articulo, confianza };
  };
}
