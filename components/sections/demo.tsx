"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Copy,
  Check,
  Code,
  Monitor,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Zap,
} from "lucide-react";
import { CanvasDraw } from "@/components/ui/canvas-draw";
import { DEMO_HTML } from "@/lib/demo-html";
import { cn } from "@/lib/utils";

type Stage = "draw" | "loading" | "result";
type ResultTab = "preview" | "code";
type ConvertErrorKind = "auth" | "config" | "quota" | "rate_limit" | "unknown";

type ConvertApiSuccess = {
  html: string;
};

type ConvertApiFailure = {
  error: string;
  errorType?: ConvertErrorKind;
};

type ConvertApiResponse = ConvertApiSuccess | ConvertApiFailure;

type ConvertErrorState = {
  kind: ConvertErrorKind;
  message: string;
};

const LOADING_TIPS = [
  "Analizando con Gemini AI...",
  "Descodificando trazos...",
  "Generando estructura semántica...",
  "Inyectando estilos modernos...",
  "Compilando resultado final...",
];

const LOADING_TIP_INTERVAL_MS = 1800;
const COPY_RESET_DELAY_MS = 2000;
const DEFAULT_ERROR_MESSAGE = "No se pudo completar la conversión.";

function isConvertFailureResponse(
  data: ConvertApiResponse | null,
): data is ConvertApiFailure {
  return Boolean(data && "error" in data);
}

async function readConvertResponse(
  response: Response,
): Promise<ConvertApiResponse | null> {
  try {
    return (await response.json()) as ConvertApiResponse;
  } catch {
    return null;
  }
}

export function Demo() {
  const [stage, setStage] = useState<Stage>("draw");
  const [resultTab, setResultTab] = useState<ResultTab>("preview");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [errorState, setErrorState] = useState<ConvertErrorState | null>(null);
  const [copied, setCopied] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [lastDataUrl, setLastDataUrl] = useState("");

  const tipIntervalRef = useRef<number | null>(null);
  const copiedTimeoutRef = useRef<number | null>(null);

  const clearTipCycle = useCallback(() => {
    if (tipIntervalRef.current !== null) {
      window.clearInterval(tipIntervalRef.current);
      tipIntervalRef.current = null;
    }
  }, []);

  const startTipCycle = useCallback(() => {
    clearTipCycle();
    setTipIndex(0);

    tipIntervalRef.current = window.setInterval(() => {
      setTipIndex((prev) => {
        if (prev >= LOADING_TIPS.length - 1) {
          clearTipCycle();
          return prev;
        }

        return prev + 1;
      });
    }, LOADING_TIP_INTERVAL_MS);
  }, [clearTipCycle]);

  useEffect(() => {
    return () => {
      clearTipCycle();

      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, [clearTipCycle]);

  const handleExport = useCallback(
    async (dataUrl: string) => {
      setStage("loading");
      setErrorState(null);
      setLastDataUrl(dataUrl);
      startTipCycle();

      try {
        const response = await fetch("/api/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: dataUrl }),
        });

        clearTipCycle();

        const data = await readConvertResponse(response);

        if (!response.ok || !data || isConvertFailureResponse(data)) {
          const failure = isConvertFailureResponse(data)
            ? data
            : {
                error: DEFAULT_ERROR_MESSAGE,
                errorType: "unknown" as const,
              };

          setErrorState({
            kind: failure.errorType ?? "unknown",
            message: failure.error,
          });
          setStage("draw");
          return;
        }

        setGeneratedHtml(data.html);
        setStage("result");
        setResultTab("preview");
      } catch (error) {
        clearTipCycle();
        setErrorState({
          kind: "unknown",
          message:
            error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
        });
        setStage("draw");
      }
    },
    [clearTipCycle, startTipCycle],
  );

  const handleRetry = useCallback(() => {
    if (lastDataUrl) {
      void handleExport(lastDataUrl);
    }
  }, [handleExport, lastDataUrl]);

  const handleLoadExample = useCallback(() => {
    clearTipCycle();
    setErrorState(null);
    setGeneratedHtml(DEMO_HTML);
    setStage("result");
    setResultTab("preview");
  }, [clearTipCycle]);

  const handleReset = useCallback(() => {
    clearTipCycle();
    setStage("draw");
    setGeneratedHtml("");
    setErrorState(null);
  }, [clearTipCycle]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopied(true);

      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }

      copiedTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, COPY_RESET_DELAY_MS);
    } catch {
      // Clipboard can fail in sandboxed contexts.
    }
  }, [generatedHtml]);

  const errorTitle =
    errorState?.kind === "rate_limit"
      ? "Gemini está ocupado"
      : errorState?.kind === "quota"
        ? "Cuota no disponible"
        : errorState?.kind === "config"
          ? "Falta la clave"
          : errorState?.kind === "auth"
            ? "Clave no válida"
            : "Error de conversión";

  return (
    <section
      id="demo"
      className="relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="demo-heading"
    >
      {/* Background blobs for depth */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-accent-primary/20 blur-[120px]" />
      <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-accent-secondary/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full glass-card px-4 py-1"
          >
            <Zap className="h-4 w-4 text-[#ff007a]" />
            <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-gradient">
              InHtml AI
            </span>
          </motion.div>
          <motion.h1
            id="demo-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[48px] font-black leading-[1.1] tracking-tight text-white sm:text-[68px]"
          >
            Del papel al <span className="text-gradient">Código</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-[19px] leading-relaxed text-slate-400"
          >
            Convierte tus bocetos en componentes HTML y CSS reales en segundos.
            Potenciado por la inteligencia visual de{" "}
            <span className="text-white font-medium">Gemini 1.5 Flash</span>.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <button
              onClick={handleLoadExample}
              className="group relative flex items-center gap-2 rounded-full bg-white/5 px-6 py-2.5 text-[14px] font-semibold text-white ring-1 ring-white/10 transition-all hover:bg-white/10 hover:ring-white/20"
            >
              <Sparkles className="h-4 w-4 text-[#00f2ff] transition-transform group-hover:rotate-12" />
              Ver demo
            </button>
            <span className="text-[14px] font-medium text-slate-500">
              Hecho con ❤️ por{" "}
              <a
                href="https://github.com/LyPaw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gradient font-bold hover:opacity-80 transition-opacity"
              >
                LyPaw
              </a>
            </span>
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold uppercase tracking-widest text-white/40">
                Lienzo de Diseño
              </span>
              {stage === "result" && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-[13px] font-bold text-white transition-all hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4" />
                  Nuevo Boceto
                </button>
              )}
            </div>

            <CanvasDraw
              onExport={handleExport}
              isLoading={stage === "loading"}
            />

            <AnimatePresence>
              {errorState && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/5 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold text-red-200">
                        {errorTitle}
                      </p>
                      <p className="mt-1 text-[14px] leading-relaxed text-red-300/80">
                        {errorState.message}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {lastDataUrl && (
                          <button
                            onClick={handleRetry}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-[13px] font-bold text-white transition-all hover:bg-white/20"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Reintentar
                          </button>
                        )}

                        <button
                          onClick={handleLoadExample}
                          className="inline-flex items-center gap-2 rounded-xl bg-neon-gradient px-4 py-2 text-[13px] font-bold text-white shadow-lg glow-pink"
                        >
                          <Sparkles className="h-4 w-4" />
                          Probar Ejemplo
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold uppercase tracking-widest text-white/40">
                Código Generado
              </span>
              {stage === "result" && (
                <div className="flex items-center gap-1 rounded-xl glass-card p-1">
                  <button
                    onClick={() => setResultTab("preview")}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-bold transition-all",
                      resultTab === "preview"
                        ? "bg-white/10 text-white shadow-inner"
                        : "text-slate-400 hover:text-white",
                    )}
                  >
                    <Monitor className="h-4 w-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => setResultTab("code")}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-bold transition-all",
                      resultTab === "code"
                        ? "bg-white/10 text-white shadow-inner"
                        : "text-slate-400 hover:text-white",
                    )}
                  >
                    <Code className="h-4 w-4" />
                    Source
                  </button>
                </div>
              )}
            </div>

            <div
              className="relative flex-1 overflow-hidden rounded-3xl glass-card"
              style={{ minHeight: "560px" }}
            >
              <AnimatePresence mode="wait">
                {stage === "draw" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-12 text-center"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 animate-pulse bg-accent-secondary/20 blur-2xl" />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 ring-1 ring-white/10">
                        <Monitor
                          className="h-10 w-10 text-slate-500"
                          strokeWidth={1}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[18px] font-bold text-white">
                        Esperando tu diseño
                      </h3>
                      <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-slate-400">
                        Dibuja algo a la izquierda y observa la magia en tiempo
                        real.
                      </p>
                    </div>
                  </motion.div>
                )}

                {stage === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-12"
                  >
                    <div className="relative flex h-24 w-24 items-center justify-center">
                      <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-dashed border-white/20" />
                      <div className="absolute inset-0 animate-ping rounded-full bg-accent-primary/10" />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-neon-gradient shadow-2xl glow-pink">
                        <Zap className="h-10 w-10 text-white" />
                      </div>
                    </div>

                    <div className="text-center" style={{ minHeight: 60 }}>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={tipIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.4 }}
                          className="text-[18px] font-bold text-white"
                        >
                          {LOADING_TIPS[tipIndex]}
                        </motion.p>
                      </AnimatePresence>
                      <p className="mt-2 text-[14px] text-slate-500">
                        InHtml está procesando tu visión...
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.span
                          key={i}
                          className="h-2 w-2 rounded-full bg-[#00f2ff]"
                          animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [1, 1.5, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {stage === "result" && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="absolute inset-0 flex flex-col"
                  >
                    {resultTab === "preview" ? (
                      <div className="h-full w-full bg-white p-2">
                        <iframe
                          srcDoc={generatedHtml}
                          className="h-full w-full rounded-2xl border-0"
                          title="Preview"
                          sandbox="allow-scripts"
                        />
                      </div>
                    ) : (
                      <div className="relative flex h-full flex-col">
                        <div className="absolute right-4 top-4 z-10 flex items-center gap-3">
                          <button
                            onClick={handleCopy}
                            className="group flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-[13px] font-bold text-white backdrop-blur-xl ring-1 ring-white/20 transition-all hover:bg-white/20"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4 text-emerald-400" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 text-slate-400 group-hover:text-white" />
                                Copiar Código
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="h-full overflow-auto bg-[#030014] p-8 pt-20 font-mono text-[13px] leading-relaxed text-slate-300 selection:bg-accent-primary/40">
                          <code>{generatedHtml}</code>
                        </pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
