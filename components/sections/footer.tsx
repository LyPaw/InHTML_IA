export function Footer() {
  return (
    <footer
      className="border-t border-white/5 bg-[#030014] py-12"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[16px] font-bold text-white tracking-tight">
            InHtml <span className="text-gradient">AI</span>
          </p>
          <p className="text-[13px] text-slate-500">
            La forma más rápida de prototipar ideas en código real.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <span className="text-[12px] uppercase tracking-widest text-slate-600 font-bold">
              Desarrollado por
            </span>
            <a
              href="https://github.com/LyPaw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] font-black text-white hover:text-gradient transition-all"
            >
              LyPaw
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 mt-8">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <p className="mt-8 text-center text-[12px] text-slate-600">
          &copy; {new Date().getFullYear()} InHtml AI. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
