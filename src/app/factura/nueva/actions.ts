"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { leerFactura, type LineaFactura } from "@/lib/gemini";
import {
  crearMatcher,
  type ArticuloCatalogo,
  type MatchResult,
} from "@/lib/catalog-match";

export type LineaConMatch = LineaFactura & { match: MatchResult };

export type CabeceraExtraida = {
  proveedor_nombre: string;
  nro_factura: string;
  fecha: string;
  moneda: string;
};

export type ProcesarFacturaResult =
  | {
      ok: true;
      cabecera: CabeceraExtraida;
      lineas: LineaConMatch[];
    }
  | { ok: false; error: string };

export async function procesarFactura(
  _prev: ProcesarFacturaResult | null,
  formData: FormData
): Promise<ProcesarFacturaResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const file = formData.get("factura");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No se recibió ningún archivo." };
  }
  if (!file.type.startsWith("image/")) {
    return {
      ok: false,
      error: `Tipo de archivo no soportado: ${file.type}. Subí un JPG o PNG.`,
    };
  }
  if (file.size > 4 * 1024 * 1024) {
    return {
      ok: false,
      error: "El archivo supera los 4 MB. Subí una versión más liviana.",
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const factura = await leerFactura(base64, file.type);

    const { data: catalogoRaw, error: catError } = await supabase
      .from("articulos")
      .select("id, codigo_gci, nombre, unidad, es_fruver")
      .range(0, 9999);
    if (catError) {
      return {
        ok: false,
        error: `No se pudo leer el catálogo: ${catError.message}`,
      };
    }
    const catalogo = (catalogoRaw ?? []) as ArticuloCatalogo[];

    const match = crearMatcher(catalogo);
    const lineas: LineaConMatch[] = factura.lineas.map((l) => ({
      ...l,
      match: match(l.descripcion),
    }));

    return {
      ok: true,
      cabecera: {
        proveedor_nombre: factura.proveedor_nombre,
        nro_factura: factura.nro_factura,
        fecha: factura.fecha,
        moneda: factura.moneda,
      },
      lineas,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return { ok: false, error: msg };
  }
}
