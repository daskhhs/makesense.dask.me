export function AppHeader() {
  return (
    <header className="animate-fade-in-up border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex w-full max-w-2xl items-center gap-2.5 px-5 py-4">
        <img
          src="/icon.png"
          alt=""
          className="h-6 w-6 rounded-md shadow-sm transition-transform duration-300 hover:rotate-6"
        />
        <span className="font-display text-xl italic tracking-tight text-[var(--ink)]">
          MakeSense
        </span>
        <span className="hidden text-xs text-[var(--muted)] sm:inline">
          · dask.me
        </span>
      </div>
    </header>
  );
}
