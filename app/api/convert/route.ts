import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a SENIOR VISION-TO-CODE ARCHITECT. Return ONLY a single complete HTML document with inline CSS and JS. No markdown fences. No explanation. Just raw HTML.`;

// gemini-2.0-flash: estable, multimodal, sin "thinking", compatible con API v1beta
const MODEL = "gemini-2.0-flash";

export async function POST(request: NextRequest) {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "Falta la clave GEMINI_API_KEY en las variables de entorno.", errorType: "config" }, { status: 500 });
  }

  let imageData: string;
  try {
    const body = await request.json();
    imageData = body.imageData;
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido." }, { status: 400 });
  }

  const match = imageData?.match(/^data:(image\/[\w+]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: "Imagen inválida o formato no soportado." }, { status: 400 });
  }

  const mimeType = match[1];
  const base64Data = match[2];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          },
          { text: "Convert this image/sketch into a complete HTML page with CSS." },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 8192,
    },
  };

  try {
    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const geminiData = await geminiRes.json();

    // Si Gemini devuelve error HTTP
    if (!geminiRes.ok) {
      const errMsg = geminiData?.error?.message || geminiRes.statusText;
      console.error("[Gemini API error]", geminiRes.status, errMsg);

      if (geminiRes.status === 401 || geminiRes.status === 403) {
        return NextResponse.json({ error: "Clave API inválida o sin permisos.", errorType: "auth" }, { status: 500 });
      }
      if (geminiRes.status === 429) {
        return NextResponse.json({ error: "Límite de peticiones alcanzado. Espera un momento.", errorType: "rate_limit" }, { status: 500 });
      }
      return NextResponse.json({ error: `Error de Gemini: ${errMsg}`, errorType: "unknown" }, { status: 500 });
    }

    // Extraer texto de la respuesta
    const candidate = geminiData?.candidates?.[0];
    const rawText: string = candidate?.content?.parts
      ?.filter((p: any) => p.text)
      ?.map((p: any) => p.text)
      ?.join("") ?? "";

    if (!rawText) {
      const reason = candidate?.finishReason ?? "sin contenido";
      console.error("[Gemini] Respuesta vacía. finishReason:", reason);
      return NextResponse.json({ error: `Gemini no generó contenido (${reason}). Intenta con un dibujo más detallado.`, errorType: "unknown" }, { status: 500 });
    }

    // Limpiar markdown fences si los hubiera
    let html = rawText
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    return NextResponse.json({ html });

  } catch (err: any) {
    console.error("[Fetch error]", err.message);
    return NextResponse.json({ error: "No se pudo conectar con Google AI. Verifica tu conexión.", errorType: "unknown" }, { status: 500 });
  }
}
