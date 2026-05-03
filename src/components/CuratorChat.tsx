"use client";

import { useRef, useState } from "react";
import type { CuratorContext } from "@/lib/curatorContext";

export type { CuratorContext };

type Msg = { role: "user" | "assistant"; content: string };

export function CuratorChat({ context }: { context: CuratorContext }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/curator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, context }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages([...next, { role: "assistant", content: data.reply || "…" }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
      queueMicrotask(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-panel/40">
      <div className="max-h-[min(50vh,420px)] space-y-3 overflow-y-auto p-3 sm:p-4">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-muted">Ask anything about this artist.</p>
        ) : null}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-zinc-800 text-zinc-100"
                : "mr-auto border border-line bg-ink/80 text-zinc-300"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading ? <p className="text-xs text-muted">Thinking…</p> : null}
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 border-t border-line p-3 sm:p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Message curator…"
          className="min-h-11 flex-1 rounded-lg border border-line bg-ink px-3 text-sm text-zinc-100 outline-none ring-accent/30 focus:ring-2"
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => void send()}
          className="min-h-11 shrink-0 rounded-lg bg-accent px-4 text-sm font-medium text-ink disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
