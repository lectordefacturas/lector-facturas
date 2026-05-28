export type LineaFactura = {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
};

export type FacturaExtraida = {
  proveedor_nombre: string;
  nro_factura: string;
  fecha: string;
  moneda: string;
  lineas: LineaFactura[];
};

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const PROMPT = [
  "Analizá esta factura uruguaya y extraé los datos.",
  "Reglas:",
  "- proveedor_nombre: nombre del comercio que emite la factura.",
  "- nro_factura: número o identificador de la factura.",
  "- fecha: en formato DD/MM/YYYY.",
  "- moneda: código (UYU, USD, etc).",
  "- lineas: cada producto/servicio facturado con su cantidad y precio_unitario en moneda local.",
  "- Si no podés leer algún dato, devolvelo como string vacío o 0 según corresponda.",
].join(" ");

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    proveedor_nombre: { type: "string" },
    nro_factura: { type: "string" },
    fecha: { type: "string" },
    moneda: { type: "string" },
    lineas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          descripcion: { type: "string" },
          cantidad: { type: "number" },
          precio_unitario: { type: "number" },
        },
        required: ["descripcion", "cantidad", "precio_unitario"],
      },
    },
  },
  required: ["proveedor_nombre", "nro_factura", "fecha", "moneda", "lineas"],
};

export async function leerFactura(
  imageBase64: string,
  mimeType: string
): Promise<FacturaExtraida> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta GEMINI_API_KEY en variables de entorno");
  }

  const payload = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
          { text: PROMPT },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Respuesta inesperada de Gemini (sin texto)");
  }

  return JSON.parse(text) as FacturaExtraida;
}
