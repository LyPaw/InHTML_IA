
## 🚀 Demo en vivo
Puedes probar la aplicación aquí: [https://in-html-ia.vercel.app/](https://in-html-ia.vercel.app/)
    

# 🚀 InHtml AI | Del papel al Código

<div align="center">

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer-0055FF?style=for-the-badge&logo=framer&logoColor=white)

---

### 🤖 Potenciado por Inteligencia Artificial
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Claude AI](https://img.shields.io/badge/Claude%20AI-D97757?style=for-the-badge&logo=anthropic&logoColor=white)
![ChatGPT](https://img.shields.io/badge/ChatGPT-74aa17?style=for-the-badge&logo=openai&logoColor=white)
![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-000000?style=for-the-badge&logo=githubcopilot&logoColor=white)

---

### 🛠️ Herramientas de Desarrollo
![Zed Editor](https://img.shields.io/badge/Zed%20Editor-000000?style=for-the-badge&logo=zed&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

</div>

---

**InHtml AI** es una herramienta experimental que transforma bocetos hechos a mano en código **HTML y CSS** listo para producción en segundos. Utiliza la potencia de visión de **Gemini 1.5 Flash** para analizar trazos, formas y colores, convirtiendo una idea visual en una interfaz funcional.

---

## ✨ Características Principales

*   🎨 **Lienzo de Dibujo Avanzado:** Herramientas de Lápiz, Borrador y **Bote de Pintura (Flood-fill)**.
*   🌈 **Selector de Color Pro:** Paleta neón predefinida y selector de color manual integrado.
*   🧠 **Gemini AI Engine:** Integración con Google Gemini para una detección de UI precisa.
*   🔮 **Vista Previa en Tiempo Real:** Renderizado instantáneo del código generado.
*   💎 **Interfaz Neon Glassmorphism:** Un diseño único, oscuro y vibrante con efectos de cristal.
*   🛡️ **Resiliencia de API:** Sistema de reintentos automáticos para manejar errores temporales (503/429).

---

## 🤖 Desarrollo con IA (Contexto del Proyecto)

Este proyecto ha sido desarrollado íntegramente de forma **asistida y autónoma** mediante una colaboración multi-IA y herramientas de última generación.

**Stack de Co-creación:**
*   **Editor:** [Zed](https://zed.dev/), utilizado por su integración nativa con lenguajes y velocidad.
*   **Orquestación:** [Gemini CLI](https://github.com/google/gemini-cli) para la ejecución de comandos y refactorización autónoma.
*   **Asistencia:** Una sinergia entre **Claude 3.5 Sonnet**, **GPT-4o** y **GitHub Copilot** para la resolución de problemas lógicos y estructurales.

### 📜 El Contexto del Agente (System Mandates)
Para que la IA pudiera construir esta app, se utilizó un archivo de **Instrucciones de Sistema** que define el comportamiento del agente:
1.  **Ciclo de Vida:** Investigación -> Estrategia -> Ejecución.
2.  **Integridad Técnica:** Actualizaciones quirúrgicas e idiomáticas.
3.  **Validación:** Verificación empírica de cada cambio.

### 📝 El Prompt Maestro (Initial Prompt)
El punto de partida tras cargar el contexto fue el siguiente prompt de arquitectura extraído de `Promp.txt`:

```text
ROLE: SENIOR VISION-TO-CODE ARCHITECT & FULL-STACK ENGINEER
Context & Mindset:
You are a world-class Full-Stack Developer specialized in Design-to-Code systems. Your task is to act as a high-fidelity compiler that transforms visual inputs (sketches, wireframes, or screenshots) into production-ready web applications. You must act as the Lead Architect, providing not just the code, but the complete project structure.

Project Scaffolding & Architecture:

Complete File System: You must generate the entire folder structure and every necessary file to make the project run immediately.

Modular Organization: Separate logic into @/components, @/lib, @/hooks, and @/app (following Next.js App Router conventions).

Configuration Files: Include tailwind.config.ts, tsconfig.json, and next.config.mjs if the project requires specific custom logic seen in the image.

Boilerplate Excellence: Every file must include the necessary imports and exports to be functional without manual intervention.

Technical Stack Requirements:

Framework: Next.js 15+ (App Router) with React 19.

Styling: Tailwind CSS 4.0+ (utility-first, using modern container queries and logical properties).

Components: Accessible primitives from Radix UI or Shadcn/UI.

Icons: Lucide React for consistent, scalable vector icons.

Motion: Framer Motion for subtle, professional entrance animations and hover states.

Visual Analysis Protocol:

Structural Mapping: Identify the layout strategy (CSS Grid or Flexbox). Detect sections like Hero, Features, Grids, and Navigation.

Element Interpretation: Interpret hand-drawn placeholders as high-fidelity next/image components with proper aspect ratios (aspect-video, aspect-square).

Visual Tokens: Extract colors, border-radii (e.g., rounded-2xl), and spacing scales from the visual weight of the drawing.

Strict Implementation Rules:

Semantic Excellence: Use <main>, <section>, <article>, and <nav>. Avoid "div-soup".

Clean Code & Documentation: All code must follow SOLID principles. Document every component in English using JSDoc, explaining the "why" behind the layout choices.

Responsive Strategy: Implement a mobile-first approach using Tailwind's responsive prefixes.

Zero-Placeholder Policy: Use high-quality placeholders from Unsplash or specialized SVG patterns that match the color palette of the sketch.

Interactive Logic: Implement React state (useState, useActionState) for buttons, forms, or toggles.

Execution Workflow:

Analysis: Briefly describe in Spanish what you detected in the image.

Tree Structure: Display a visual ASCII tree of the proposed folder and file structure.

Code Implementation: Provide the code for every single file mentioned in the tree.

PR Summary: Conclude with a brief "Pull Request" summary in Spanish, detailing technical decisions.

Language Note:
Communication with the user is in Spanish. All code, file names, variables, comments, and technical documentation must be strictly in English.
```

*(Nota: El contenido completo de Promp.txt se mantiene en el archivo README.md final)*

---

## 🚀 Instalación y Configuración

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/LyPaw/InHtml.git
    cd InHtml
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno**
    Crea un archivo `.env.local`:
    ```env
    GEMINI_API_KEY=tu_clave_aqui
    ```

---

## ✒️ Autor

Desarrollado con ❤️ por **[LyPaw](https://github.com/LyPaw)** mediante una colaboración avanzada con **Multi-IA**.
