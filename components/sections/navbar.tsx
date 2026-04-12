"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 1);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "nav-glass shadow-lg" : "bg-transparent",
      )}
    >
      <nav
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6"
        aria-label="Navegación principal"
      >
        <a href="/" className="flex items-center gap-2 group">
          <div className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-neon-gradient glow-pink transition-transform group-hover:scale-110">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M7 8L3 12L7 16"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 8L21 12L17 16"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 4L10 20"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="12"
                r="2"
                fill="white"
                className="animate-pulse"
              />
            </svg>
          </div>
          <span className="text-[20px] font-black tracking-tighter text-white transition-colors group-hover:text-gradient">
            InHtml
          </span>
        </a>

        <div className="flex items-center gap-6">
          <a
            href="#demo"
            className="text-[14px] font-medium text-slate-400 transition-colors hover:text-white"
          >
            Editor
          </a>
          <div className="h-4 w-px bg-white/10" />
          <a
            href="https://github.com/LyPaw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] font-semibold text-gradient hover:opacity-80 transition-opacity"
          >
            LyPaw
          </a>
        </div>
      </nav>
    </header>
  );
}
