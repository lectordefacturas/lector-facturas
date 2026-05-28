"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { leerFactura, type FacturaExtraida } from "@/lib/gemini";

export type ProcesarFacturaResult =
  | { ok: true; factura: FacturaExtraida }
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
    return { ok: true, factura };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return { ok: false, error: msg };
  }
}
