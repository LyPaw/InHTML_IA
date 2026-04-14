import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a SENIOR VISION-TO-CODE ARCHITECT. Return ONLY a single complete HTML document with inline CSS and JS. No markdown fences. No explanation. Just raw HTML.`;

// Groq free tier – Llama 4 Scout con visión
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

export async function POST(request: NextRequest) {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta la clave GROQ_API_KEY en las variables de entorno.", errorType: "config" },
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

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8192,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageData, // Groq acepta data URL directamente
                },
              },
              {
                type: "text",
                text: "Convert this image/sketch into a complete HTML page with CSS.",
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[Groq error]", response.status, JSON.stringify(data));

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: "Clave API inválida o sin permisos.", errorType: "auth" },
          { status: 500 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Límite de uso alcanzado. Espera unos segundos e inténtalo de nuevo.", errorType: "rate_limit" },
          { status: 500 }
        );
      }

      const errMsg = data?.error?.message || response.statusText || "error desconocido";
      return NextResponse.json(
        { error: `Error de Groq (${response.status}): ${errMsg}`, errorType: "unknown" },
        { status: 500 }
      );
    }

    const rawText: string = data?.choices?.[0]?.message?.content ?? "";

    if (!rawText) {
      const reason = data?.choices?.[0]?.finish_reason ?? "sin contenido";
      console.error("[Groq] Sin texto. finish_reason:", reason);
      return NextResponse.json(
        {
          error: `El modelo no generó contenido (${reason}). Intenta con un dibujo más detallado.`,
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
      { error: "No se pudo conectar con Groq. Verifica tu conexión.", errorType: "unknown" },
      { status: 500 }
    );
  }
}
