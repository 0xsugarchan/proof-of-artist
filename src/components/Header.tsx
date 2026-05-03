import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-line/80 bg-ink/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-sm font-medium tracking-tight text-zinc-100">
          Proof of Artist
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          ENS status
        </span>
      </div>
    </header>
  );
}
