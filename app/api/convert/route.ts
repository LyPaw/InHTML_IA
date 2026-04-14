import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are a SENIOR VISION-TO-CODE ARCHITECT. Return ONLY a single complete HTML document. No markdown fences.`;

// Modelos en orden de preferencia (de mejor a más básico)
const MODEL_PRIORITY = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

export async function POST(request: NextRequest) {
  try {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) return NextResponse.json({ error: "No API KEY" }, { status: 500 });

    const { imageData } = await request.json();
    const match = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) return NextResponse.json({ error: "Imagen inválida" }, { status: 400 });

    const mimeType = match[1];
    const data = match[2];

    const genAI = new GoogleGenerativeAI(apiKey);

    // --- PASO 1: LISTAR MODELOS DISPONIBLES EN TU CLAVE/REGIÓN ---
    let availableModels: string[] = [];
    try {
      const modelList = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      const json = await modelList.json();
      availableModels =
        json.models
          ?.map((m: any) => m.name.replace("models/", ""))
          .filter((m: string) => m.includes("gemini")) || [];
      console.log(`[DEBUG] Modelos disponibles: ${availableModels.join(", ")}`);
    } catch (e) {
      console.error("No se pudo listar modelos:", e);
    }

    // --- PASO 2: ELEGIR EL MEJOR MODELO DISPONIBLE ---
    let modelToUse = "gemini-2.5-flash"; // fallback por defecto

    if (availableModels.length > 0) {
      const found = MODEL_PRIORITY.find((preferred) =>
        availableModels.some((available) => available.startsWith(preferred))
      );
      if (found) modelToUse = found;
    }

    console.log(`[DEBUG] Usando modelo: ${modelToUse}`);

    const model = genAI.getGenerativeModel({ model: modelToUse });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      {
        inlineData: { data, mimeType },
      },
      { text: "Generate HTML/CSS from this image." },
    ]);

    const response = await result.response;
    let html = response.text();
    html = html
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    return NextResponse.json({ html });

  } catch (error: any) {
    console.error("[ERROR]:", error.message);
    return NextResponse.json(
      {
        error: "Error de acceso a Google AI",
        details: error.message,
        hint: "Verifica que tu GEMINI_API_KEY sea válida.",
      },
      { status: 500 }
    );
  }
}
