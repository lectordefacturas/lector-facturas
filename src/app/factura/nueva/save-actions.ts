"use server";

import { createClient } from "@/lib/supabase/server";

export type LineaGuardada = {
  articulo_nombre: string;
  codigo_gci: string;
  um_cantidad: string;
  cantidad: number | "";
  cantidad_bonificada: number | "";
  precio_unitario: number | "";
  um_precio: string;
  centro_costo_linea: string;
  comentario: string;
};

export type CabeceraGuardada = {
  proveedor_nombre: string;
  proveedor_codigo: string;
  nro_factura: string;
  fecha: string; // YYYY-MM-DD
  moneda: string;
  centro_costo: string;
};

export type GuardarFacturaInput = {
  facturaId: string | null;
  cabecera: CabeceraGuardada;
  lineas: LineaGuardada[];
  estado: "borrador" | "final";
};

export type GuardarFacturaResult =
  | { ok: true; facturaId: string }
  | { ok: false; error: string };

function nullOrNumber(v: number | ""): number | null {
  return v === "" ? null : v;
}

function nullOrString(v: string): string | null {
  const t = v.trim();
  return t === "" ? null : t;
}

export async function guardarFactura(
  input: GuardarFacturaInput
): Promise<GuardarFacturaResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "No estás logueado." };
  }

  if (!input.cabecera.proveedor_nombre.trim()) {
    return { ok: false, error: "Falta el nombre del proveedor." };
  }
  if (!input.cabecera.nro_factura.trim()) {
    return { ok: false, error: "Falta el número de factura." };
  }
  if (!input.cabecera.centro_costo.trim()) {
    return { ok: false, error: "Falta el centro de costo." };
  }
  const lineasValidas = input.lineas.filter(
    (l) => l.articulo_nombre.trim() || l.codigo_gci.trim()
  );
  if (lineasValidas.length === 0) {
    return { ok: false, error: "No hay líneas para guardar." };
  }

  // Buscar el hotel_id a partir de la membresía del usuario actual.
  const { data: miembro } = await supabase
    .from("miembros_hotel")
    .select("hotel_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!miembro) {
    return {
      ok: false,
      error:
        "Tu usuario no está vinculado a ningún hotel. Pediselo a un admin.",
    };
  }

  const facturaPayload = {
    hotel_id: miembro.hotel_id,
    proveedor_codigo: nullOrString(input.cabecera.proveedor_codigo),
    proveedor_nombre: input.cabecera.proveedor_nombre.trim(),
    nro_factura: input.cabecera.nro_factura.trim(),
    fecha: nullOrString(input.cabecera.fecha),
    moneda: input.cabecera.moneda || "UYU",
    centro_costo: input.cabecera.centro_costo.trim(),
    estado: input.estado,
  };

  let facturaId: string;

  if (input.facturaId) {
    const { error: updateError } = await supabase
      .from("facturas")
      .update(facturaPayload)
      .eq("id", input.facturaId);
    if (updateError) {
      return {
        ok: false,
        error: `No se pudo actualizar la factura: ${updateError.message}`,
      };
    }
    facturaId = input.facturaId;

    // Reemplazar líneas: borrar las viejas, insertar las nuevas.
    const { error: delError } = await supabase
      .from("lineas_factura")
      .delete()
      .eq("factura_id", facturaId);
    if (delError) {
      return {
        ok: false,
        error: `No se pudieron borrar las líneas viejas: ${delError.message}`,
      };
    }
  } else {
    const { data, error: insertError } = await supabase
      .from("facturas")
      .insert({ ...facturaPayload, creado_por: user.id })
      .select("id")
      .single();
    if (insertError || !data) {
      return {
        ok: false,
        error: `No se pudo crear la factura: ${insertError?.message ?? "desconocido"}`,
      };
    }
    facturaId = data.id;
  }

  const filas = lineasValidas.map((l, i) => ({
    factura_id: facturaId,
    nro_linea: i + 1,
    articulo_codigo_gci: nullOrString(l.codigo_gci),
    articulo_nombre: l.articulo_nombre.trim() || "(sin nombre)",
    um_cantidad: nullOrString(l.um_cantidad),
    cantidad: nullOrNumber(l.cantidad),
    cantidad_bonificada: nullOrNumber(l.cantidad_bonificada),
    precio_unitario: nullOrNumber(l.precio_unitario),
    um_precio: nullOrString(l.um_precio),
    centro_costo_linea: nullOrString(l.centro_costo_linea),
    comentario: nullOrString(l.comentario),
  }));

  const { error: insLinError } = await supabase
    .from("lineas_factura")
    .insert(filas);
  if (insLinError) {
    return {
      ok: false,
      error: `No se pudieron guardar las líneas: ${insLinError.message}`,
    };
  }

  return { ok: true, facturaId };
}
