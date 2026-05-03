"use client";

import { useEffect, useRef, useState } from "react";

export type VerifyAgentApiResponse = {
  verified: boolean;
  headline: string;
  agentRegistrationKey: string;
  ensTextValue: string | null;
  registrySource: "chain" | "demo";
  registry7930: string;
  registryAddress: string;
  reasons: string[];
  record: {
    agentId: string;
    owner: string;
    claimedEnsName: string;
    agentName: string;
    agentRole: string;
    metadataURI: string;
  };
};

type Props = {
  artistEns: string;
  agentId: string;
  /** When true, show the ENSIP-25 key for setting a text record on Sepolia. */
  showSetupHint?: boolean;
  /** Fires when verification JSON is available (e.g. to pass into curator chat). */
  onVerification?: (v: VerifyAgentApiResponse) => void;
};

export function AgentEnsip25Block({ artistEns, agentId, showSetupHint, onVerification }: Props) {
  const [data, setData] = useState<VerifyAgentApiResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const onVerificationRef = useRef(onVerification);
  onVerificationRef.current = onVerification;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    void (async () => {
      try {
        const res = await fetch("/api/verify-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artistEns, agentId }),
        });
        const json = (await res.json()) as VerifyAgentApiResponse & { error?: string };
        if (!res.ok) throw new Error(json.error || "verify failed");
        const typed = json as VerifyAgentApiResponse;
        if (!cancelled) {
          setData(typed);
          onVerificationRef.current?.(typed);
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [artistEns, agentId]);

  if (loading) {
    return <p className="text-xs text-muted">Checking ENSIP-25…</p>;
  }
  if (err) {
    return <p className="text-xs text-red-400">{err}</p>;
  }
  if (!data) return null;

  return (
    <div className="space-y-2 text-sm">
      <p className={`font-medium ${data.verified ? "text-emerald-400" : "text-amber-200/90"}`}>
        {data.headline}
      </p>
      <dl className="grid gap-1 font-mono text-[10px] text-zinc-500">
        <div>
          <dt className="text-muted">Registry</dt>
          <dd className="break-all">
            {data.registrySource === "demo" ? "demo (no contract)" : "Sepolia contract"} ·{" "}
            {data.registryAddress}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Role</dt>
          <dd>{data.record.agentRole}</dd>
        </div>
        <div>
          <dt className="text-muted">Metadata</dt>
          <dd className="break-all">{data.record.metadataURI}</dd>
        </div>
      </dl>
      {!data.verified && data.reasons.length > 0 ? (
        <ul className="list-inside list-disc text-xs text-amber-200/80">
          {data.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : null}
      {showSetupHint ? (
        <div className="rounded-lg border border-line bg-ink/60 p-2 font-mono text-[10px] leading-relaxed text-zinc-400">
          <p className="mb-1 text-muted">ENSIP-25 text key (Sepolia)</p>
          <p className="break-all text-zinc-300">{data.agentRegistrationKey}</p>
          <p className="mt-1 text-muted">
            Set this key on <span className="text-zinc-300">{data.record.claimedEnsName || artistEns}</span> with
            value <span className="text-zinc-300">1</span> to complete verification.
          </p>
        </div>
      ) : null}
    </div>
  );
}
