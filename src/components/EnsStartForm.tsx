"use client";

import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { normalizeEnsInput } from "@/lib/ens";

export function EnsStartForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const name = normalizeEnsInput(value);
    if (!name) {
      setError("Enter a valid ENS name.");
      return;
    }
    router.push(`/dashboard/${encodeURIComponent(name)}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-xs text-muted">ENS name</label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="sugarchan.eth"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="min-h-11 flex-1 rounded-lg border border-line bg-panel px-3 text-sm text-zinc-100 outline-none ring-accent/40 placeholder:text-zinc-600 focus:border-accent/50 focus:ring-2"
        />
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-accent px-4 text-sm font-medium text-ink transition hover:brightness-110 active:brightness-95"
        >
          Continue
        </button>
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </form>
  );
}
