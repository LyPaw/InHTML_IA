"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Eraser, Pen, Trash2, PaintBucket, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

interface CanvasDrawProps {
  onExport: (dataUrl: string) => void;
  isLoading?: boolean;
  className?: string;
}

const COLORS = [
  { value: "#000000", label: "Black" },
  { value: "#ff007a", label: "Cyber Pink" },
  { value: "#00f2ff", label: "Electric Cyan" },
  { value: "#7000ff", label: "Neon Purple" },
  { value: "#34c759", label: "Green" },
  { value: "#ff9500", label: "Orange" },
] as const;

const SIZES = [
  { value: 2, label: "Thin" },
  { value: 5, label: "Medium" },
  { value: 12, label: "Thick" },
] as const;

const AUTO_EXPORT_DELAY_MS = 5000;

export function CanvasDraw({
  onExport,
  isLoading = false,
  className,
}: CanvasDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);
  const autoExportTimeoutRef = useRef<number | null>(null);
  const lastExportedImageRef = useRef("");

  const [tool, setTool] = useState<"pen" | "eraser" | "bucket">("pen");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [isEmpty, setIsEmpty] = useState(true);

  const clearAutoExportTimeout = useCallback(() => {
    if (autoExportTimeoutRef.current !== null) {
      window.clearTimeout(autoExportTimeoutRef.current);
      autoExportTimeoutRef.current = null;
    }
  }, []);

  const exportCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas || isLoading) {
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");

    if (dataUrl === lastExportedImageRef.current) {
      return;
    }

    lastExportedImageRef.current = dataUrl;
    onExport(dataUrl);
  }, [isLoading, onExport]);

  const scheduleAutoExport = useCallback(() => {
    clearAutoExportTimeout();

    autoExportTimeoutRef.current = window.setTimeout(() => {
      exportCanvas();
    }, AUTO_EXPORT_DELAY_MS);
  }, [clearAutoExportTimeout, exportCanvas]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) {
      return;
    }

    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    initCanvas();

    const observer = new ResizeObserver(() => {
      clearAutoExportTimeout();
      setIsEmpty(true);
      lastExportedImageRef.current = "";
      initCanvas();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [clearAutoExportTimeout, initCanvas]);

  useEffect(() => {
    return () => {
      clearAutoExportTimeout();
    };
  }, [clearAutoExportTimeout]);

  const getPoint = (event: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    if ("touches" in event) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const floodFill = useCallback(
    (startX: number, startY: number, fillColor: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const x = Math.round(startX * dpr);
      const y = Math.round(startY * dpr);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const targetR = data[(y * canvas.width + x) * 4];
      const targetG = data[(y * canvas.width + x) * 4 + 1];
      const targetB = data[(y * canvas.width + x) * 4 + 2];
      const targetA = data[(y * canvas.width + x) * 4 + 3];

      // Convert hex to RGB
      const tempElement = document.createElement("div");
      tempElement.style.color = fillColor;
      document.body.appendChild(tempElement);
      const rgb = window
        .getComputedStyle(tempElement)
        .color.match(/\d+/g)!
        .map(Number);
      document.body.removeChild(tempElement);
      const [fillR, fillG, fillB] = rgb;

      if (
        targetR === fillR &&
        targetG === fillG &&
        targetB === fillB &&
        targetA === 255
      )
        return;

      const stack: [number, number][] = [[x, y]];
      while (stack.length > 0) {
        const [currX, currY] = stack.pop()!;
        let pixelPos = (currY * canvas.width + currX) * 4;

        if (
          currX < 0 ||
          currX >= canvas.width ||
          currY < 0 ||
          currY >= canvas.height ||
          data[pixelPos] !== targetR ||
          data[pixelPos + 1] !== targetG ||
          data[pixelPos + 2] !== targetB ||
          data[pixelPos + 3] !== targetA
        )
          continue;

        data[pixelPos] = fillR;
        data[pixelPos + 1] = fillG;
        data[pixelPos + 2] = fillB;
        data[pixelPos + 3] = 255;

        stack.push([currX + 1, currY]);
        stack.push([currX - 1, currY]);
        stack.push([currX, currY + 1]);
        stack.push([currX, currY - 1]);
      }

      ctx.putImageData(imageData, 0, 0);
      setIsEmpty(false);
      scheduleAutoExport();
    },
    [scheduleAutoExport],
  );

  const startDrawing = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      clearAutoExportTimeout();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const point = getPoint(event);

      if (tool === "bucket") {
        floodFill(point.x, point.y, color);
        return;
      }

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      isDrawing.current = true;
      lastPoint.current = point;

      ctx.beginPath();
      ctx.arc(
        point.x,
        point.y,
        (tool === "eraser" ? size * 3 : size) / 2,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.fill();

      setIsEmpty(false);
    },
    [clearAutoExportTimeout, color, size, tool, floodFill],
  );

  const draw = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();

      if (!isDrawing.current || tool === "bucket") {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const current = getPoint(event);
      const last = lastPoint.current;

      if (!last) return;

      ctx.beginPath();

      if (tool === "eraser") {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = size * 3;
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const midX = (last.x + current.x) / 2;
      const midY = (last.y + current.y) / 2;
      ctx.moveTo(last.x, last.y);
      ctx.quadraticCurveTo(last.x, last.y, midX, midY);
      ctx.stroke();

      lastPoint.current = current;
    },
    [color, size, tool],
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing.current) return;

    isDrawing.current = false;
    lastPoint.current = null;

    if (!isEmpty) {
      scheduleAutoExport();
    }
  }, [isEmpty, scheduleAutoExport]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
    };
  }, [draw, startDrawing, stopDrawing]);

  const handleClear = () => {
    clearAutoExportTimeout();

    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) {
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) {
      return;
    }

    const rect = container.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    lastExportedImageRef.current = "";
    setIsEmpty(true);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl glass-card px-4 py-3">
        <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
          <button
            onClick={() => setTool("pen")}
            aria-label="Pen tool"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
              tool === "pen"
                ? "bg-neon-gradient text-white glow-pink"
                : "text-slate-400 hover:text-white hover:bg-white/10",
            )}
          >
            <Pen className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setTool("bucket")}
            aria-label="Bucket tool"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
              tool === "bucket"
                ? "bg-neon-gradient text-white glow-pink"
                : "text-slate-400 hover:text-white hover:bg-white/10",
            )}
          >
            <PaintBucket className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setTool("eraser")}
            aria-label="Eraser tool"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
              tool === "eraser"
                ? "bg-cyan-gradient text-white glow-cyan"
                : "text-slate-400 hover:text-white hover:bg-white/10",
            )}
          >
            <Eraser className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 border-x border-white/10">
          {COLORS.map((colorOption) => (
            <button
              key={colorOption.value}
              onClick={() => {
                setColor(colorOption.value);
                if (tool === "eraser") setTool("pen");
              }}
              style={{ backgroundColor: colorOption.value }}
              className={cn(
                "h-6 w-6 rounded-full transition-all border border-white/20",
                color === colorOption.value
                  ? "scale-125 ring-2 ring-white"
                  : "hover:scale-110",
              )}
            />
          ))}
          <div className="relative group ml-1">
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                if (tool === "eraser") setTool("pen");
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="h-6 w-6 rounded-full border border-white/40 flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors"
              style={{ borderColor: color }}
            >
              <Palette className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {SIZES.map((sizeOption) => (
            <button
              key={sizeOption.value}
              onClick={() => setSize(sizeOption.value)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                size === sizeOption.value
                  ? "bg-white/20 text-white ring-1 ring-white/30"
                  : "text-slate-400 hover:bg-white/10",
              )}
            >
              <span
                className="rounded-full bg-current"
                style={{
                  width:
                    sizeOption.value === 2
                      ? 4
                      : sizeOption.value === 5
                        ? 7
                        : 11,
                  height:
                    sizeOption.value === 2
                      ? 4
                      : sizeOption.value === 5
                        ? 7
                        : 11,
                }}
              />
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-medium text-slate-400 transition-all hover:bg-red-500/20 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Limpiar
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl glass-card group"
        style={{ height: "420px" }}
      >
        <div className="absolute inset-0 bg-white/95" />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10 block cursor-crosshair touch-none"
          style={{ width: "100%", height: "100%" }}
        />

        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 text-slate-300">
            <div className="p-4 rounded-full bg-slate-100 ring-4 ring-slate-50">
              <Pen className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-[16px] font-bold text-slate-600">
                Dibuja tu idea
              </p>
              <p className="text-[13px] text-slate-400">
                Botones, inputs, tarjetas...
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl glass-card px-4 py-3 text-[13px] text-slate-400 text-center">
        Al dejar de dibujar,{" "}
        <span className="text-gradient font-bold">Groq</span> analizará tu
        boceto automáticamente.
      </div>
    </div>
  );
}
