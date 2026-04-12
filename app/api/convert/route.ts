import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are a SENIOR VISION-TO-CODE ARCHITECT. Return ONLY a single complete HTML document. No markdown fences.`;

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

    // --- PASO 1: LISTAR MODELOS DISPONIBLES ---
    // Esto nos dirá exactamente qué modelos puede usar TU clave en TU región
    let availableModels: string[] = [];
    try {
        // Intentamos obtener la lista de modelos (esto requiere permisos de visualización)
        // Si falla, usaremos una lista de fallback más agresiva
        const modelList = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const json = await modelList.json();
        availableModels = json.models?.map((m: any) => m.name.replace("models/", "")) || [];
    } catch (e) {
        console.error("No se pudo listar modelos:", e);
    }

    // --- PASO 2: ELEGIR EL MEJOR MODELO ---
    // Buscamos modelos de visión en orden de preferencia
    const visionModels = availableModels.filter(m => m.includes("flash") || m.includes("pro") || m.includes("vision"));
    
    // Si no pudimos listar o no hay modelos, probamos con el alias más básico
    const modelToUse = visionModels.length > 0 ? visionModels[0] : "gemini-1.5-flash-8b";

    console.log(`[DEBUG] Modelos detectados: ${availableModels.join(", ")}`);
    console.log(`[DEBUG] Usando modelo: ${modelToUse}`);

    const model = genAI.getGenerativeModel({ model: modelToUse });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      {
        inlineData: { data, mimeType },
      },
      { text: "Generate HTML/CSS from this image." }
    ]);

    const response = await result.response;
    let html = response.text();
    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

    return NextResponse.json({ html });

  } catch (error: any) {
    console.error("[ERROR]:", error.message);
    return NextResponse.json({ 
      error: "Error de acceso a Google AI", 
      details: error.message,
      hint: "Tu clave de API no parece tener acceso a los modelos de visión de Gemini 1.5. Verifica si estás en una región admitida o intenta usar una VPN."
    }, { status: 500 });
  }
}
