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
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  // Retry con backoff para errores transientes (503 modelo saturado, 429 rate limit).
  const TRANSIENT_STATUSES = new Set([429, 503]);
  const MAX_INTENTOS = 3;
  let response: Response | null = null;
  let ultimoError = "";
  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) break;
    ultimoError = await response.text();
    if (!TRANSIENT_STATUSES.has(response.status) || intento === MAX_INTENTOS) {
      break;
    }
    // Espera 2s, 4s entre reintentos.
    const waitMs = 2000 * intento;
    await new Promise((r) => setTimeout(r, waitMs));
  }

  if (!response || !response.ok) {
    if (response && response.status === 503) {
      throw new Error(
        "Gemini está saturado momentáneamente. Esperá un minuto y volvé a intentar."
      );
    }
    if (response && response.status === 429) {
      throw new Error(
        "Superaste el límite de uso de Gemini por ahora. Esperá unos minutos."
      );
    }
    throw new Error(
      `Gemini ${response?.status ?? "?"}: ${ultimoError.slice(0, 300)}`
    );
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  const finishReason = candidate?.finishReason;

  if (!text) {
    throw new Error(
      `Respuesta inesperada de Gemini (sin texto, finishReason=${finishReason})`
    );
  }

  try {
    return JSON.parse(text) as FacturaExtraida;
  } catch (err) {
    const cortado = finishReason && finishReason !== "STOP";
    const motivo = cortado
      ? `Gemini cortó la respuesta antes de terminar (finishReason=${finishReason}). Probá con una imagen más chica o con menos líneas.`
      : `No se pudo parsear el JSON devuelto por Gemini.`;
    const detalle = err instanceof Error ? err.message : "error desconocido";
    throw new Error(`${motivo} Detalle: ${detalle}`);
  }
}
