import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a SENIOR VISION-TO-CODE ARCHITECT. Return ONLY a single complete HTML document with inline CSS and JS. No markdown fences. No explanation. Just raw HTML.`;

const MODEL = "gemini-2.0-flash";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callGeminiWithRetry(
  url: string,
  payload: object,
  maxRetries = 4
): Promise<{ res: Response; data: any }> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status !== 429) {
      return { res, data };
    }

    // 429 → esperar y reintentar: 1s · 2s · 4s · 8s
    const waitMs = Math.pow(2, attempt) * 1000;
    console.warn(`[Gemini] 429 – reintento ${attempt + 1}/${maxRetries} en ${waitMs}ms`);
    await sleep(waitMs);
  }

  // Último intento tras todos los backoffs
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export async function POST(request: NextRequest) {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta la clave GEMINI_API_KEY en las variables de entorno.", errorType: "config" },
      { status: 500 }
    );
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
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: "user",
        parts: [
          { inline_data: { mime_type: mimeType, data: base64Data } },
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
    const { res: geminiRes, data: geminiData } = await callGeminiWithRetry(url, payload, 4);

    // Log completo para debug en Vercel → Functions → Logs
    if (!geminiRes.ok) {
      console.error("[Gemini error]", geminiRes.status, JSON.stringify(geminiData));
    }

    if (!geminiRes.ok) {
      const errMsg = geminiData?.error?.message || geminiRes.statusText || "error desconocido";

      if (geminiRes.status === 401 || geminiRes.status === 403) {
        return NextResponse.json(
          { error: "Clave API inválida o sin permisos.", errorType: "auth" },
          { status: 500 }
        );
      }
      if (geminiRes.status === 429) {
        return NextResponse.json(
          { error: "Gemini sigue ocupado. Espera unos segundos e inténtalo de nuevo.", errorType: "rate_limit" },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: `Error de Gemini (${geminiRes.status}): ${errMsg}`, errorType: "unknown" },
        { status: 500 }
      );
    }

    console.log("[Gemini OK] respuesta recibida:", JSON.stringify(geminiData).slice(0, 200));

    const candidate = geminiData?.candidates?.[0];
    const rawText: string =
      candidate?.content?.parts
        ?.filter((p: any) => p.text)
        ?.map((p: any) => p.text)
        ?.join("") ?? "";

    if (!rawText) {
      const reason = candidate?.finishReason ?? "sin contenido";
      console.error("[Gemini] Sin texto. finishReason:", reason, JSON.stringify(candidate));
      return NextResponse.json(
        {
          error: `Gemini no generó contenido (${reason}). Intenta con un dibujo más detallado.`,
          errorType: "unknown",
        },
        { status: 500 }
      );
    }

    const html = rawText
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    return NextResponse.json({ html });
  } catch (err: any) {
    console.error("[Fetch error]", err.message, err.stack);
    return NextResponse.json(
      { error: "No se pudo conectar con Google AI. Verifica tu conexión.", errorType: "unknown" },
      { status: 500 }
    );
  }
}
