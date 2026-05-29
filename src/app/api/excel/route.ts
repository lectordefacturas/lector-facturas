import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generarExcelGCI,
  nombreArchivoGCI,
  type GenerarExcelInput,
} from "@/lib/gci-excel";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let payload: GenerarExcelInput;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (
    !payload?.cabecera ||
    !Array.isArray(payload.lineas) ||
    typeof payload.centro_costo !== "string" ||
    !payload.centro_costo.trim()
  ) {
    return NextResponse.json(
      { error: "Faltan campos requeridos (cabecera, lineas, centro_costo)" },
      { status: 400 }
    );
  }

  const buffer = generarExcelGCI(payload);
  const filename = nombreArchivoGCI(payload.cabecera.nro_factura);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
