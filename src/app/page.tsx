import { EnsStartForm } from "@/components/EnsStartForm";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Proof of Artist</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Verified ENS artist status
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-zinc-400">
          Prove who you are, which contracts are official, and how much ETH your work generated—then
          let your curator agent speak for you.
        </p>
      </section>

      <section className="rounded-2xl border border-line bg-panel/50 p-4 sm:p-6">
        <h2 className="text-sm font-medium text-zinc-200">Start</h2>
        <p className="mt-1 text-xs text-muted">Enter your ENS. We resolve it on Ethereum testnet.</p>
        <div className="mt-4">
          <EnsStartForm />
        </div>
      </section>
    </div>
  );
}
