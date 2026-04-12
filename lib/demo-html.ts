export const DEMO_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>InHtml - Ejemplo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
      background: linear-gradient(180deg, #f6f7fb 0%, #ffffff 100%);
      color: #1d1d1f;
      min-height: 100vh;
      padding: 32px;
    }

    .shell {
      max-width: 980px;
      margin: 0 auto;
      display: grid;
      gap: 24px;
    }

    .header,
    .panel,
    .card {
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 24px;
      box-shadow: 0 18px 40px rgba(19, 24, 36, 0.08);
    }

    .header {
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .logo {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      background: #1d1d1f;
      color: white;
      display: grid;
      place-items: center;
      font-size: 15px;
      font-weight: 700;
    }

    .author {
      color: #6e6e73;
      font-size: 14px;
    }

    .panel {
      padding: 28px;
      display: grid;
      gap: 24px;
    }

    .hero h1 {
      font-size: clamp(36px, 5vw, 58px);
      line-height: 1.02;
      letter-spacing: -0.05em;
      margin-bottom: 12px;
    }

    .hero p {
      max-width: 640px;
      color: #6e6e73;
      font-size: 18px;
      line-height: 1.6;
    }

    .grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 20px;
    }

    .card {
      padding: 22px;
      display: grid;
      gap: 16px;
    }

    .card h2 {
      font-size: 16px;
      letter-spacing: -0.02em;
    }

    .sketch {
      min-height: 280px;
      border-radius: 20px;
      border: 2px dashed rgba(0, 113, 227, 0.25);
      background:
        linear-gradient(180deg, rgba(0,113,227,0.06), rgba(255,255,255,0.7)),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 23px,
          rgba(0,0,0,0.03) 24px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 23px,
          rgba(0,0,0,0.03) 24px
        );
      position: relative;
      overflow: hidden;
    }

    .shape {
      position: absolute;
      background: white;
      border: 2px solid #1d1d1f;
      border-radius: 16px;
    }

    .shape.topbar {
      left: 24px;
      right: 24px;
      top: 24px;
      height: 32px;
      border-radius: 12px;
    }

    .shape.title {
      left: 24px;
      top: 78px;
      width: 52%;
      height: 24px;
      border-radius: 10px;
    }

    .shape.copy {
      left: 24px;
      top: 116px;
      width: 70%;
      height: 16px;
      border-radius: 10px;
      opacity: 0.75;
    }

    .shape.block {
      left: 24px;
      right: 24px;
      top: 154px;
      bottom: 24px;
      border-radius: 22px;
    }

    .preview {
      border-radius: 20px;
      background: #111214;
      color: #f8f8f2;
      padding: 18px;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 13px;
      line-height: 1.6;
      min-height: 280px;
      overflow: auto;
    }

    .preview .tag { color: #7dd3fc; }
    .preview .attr { color: #f9a8d4; }
    .preview .value { color: #86efac; }

    .footer-note {
      color: #86868b;
      font-size: 14px;
      text-align: center;
    }

    @media (max-width: 820px) {
      body { padding: 18px; }
      .grid { grid-template-columns: 1fr; }
      .header { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header class="header">
      <div class="brand">
        <div class="logo">IH</div>
        <div>
          <div>InHtml</div>
          <div class="author">Autor: LyPaw</div>
        </div>
      </div>
      <div class="author">Ejemplo simple de HTML y CSS</div>
    </header>

    <section class="panel">
      <div class="hero">
        <h1>Dibujo convertido en código</h1>
        <p>
          Este ejemplo muestra una interfaz limpia con un boceto a la izquierda y
          el resultado en HTML y CSS a la derecha.
        </p>
      </div>

      <div class="grid">
        <article class="card">
          <h2>Boceto</h2>
          <div class="sketch">
            <div class="shape topbar"></div>
            <div class="shape title"></div>
            <div class="shape copy"></div>
            <div class="shape block"></div>
          </div>
        </article>

        <article class="card">
          <h2>Código</h2>
          <div class="preview">
            <div><span class="tag">&lt;section</span> <span class="attr">class</span>=<span class="value">"panel"</span><span class="tag">&gt;</span></div>
            <div>&nbsp;&nbsp;<span class="tag">&lt;header</span> <span class="attr">class</span>=<span class="value">"topbar"</span><span class="tag">&gt;</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="tag">&lt;h1&gt;</span>InHtml<span class="tag">&lt;/h1&gt;</span></div>
            <div>&nbsp;&nbsp;<span class="tag">&lt;/header&gt;</span></div>
            <div>&nbsp;&nbsp;<span class="tag">&lt;main</span> <span class="attr">class</span>=<span class="value">"content"</span><span class="tag">&gt;</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="tag">&lt;div</span> <span class="attr">class</span>=<span class="value">"card"</span><span class="tag">&gt;&lt;/div&gt;</span></div>
            <div>&nbsp;&nbsp;<span class="tag">&lt;/main&gt;</span></div>
            <div><span class="tag">&lt;/section&gt;</span></div>
          </div>
        </article>
      </div>
    </section>

    <p class="footer-note">InHtml convierte bocetos en una base visual lista para editar.</p>
  </div>
</body>
</html>`;
