"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EnsProfile } from "@/lib/ens";
import type { ArtistConfig } from "@/lib/artistStore";
import { loadArtistConfig } from "@/lib/artistStore";
import { mockMetricsForContracts } from "@/lib/mockOnchain";
import { CuratorChat } from "@/components/CuratorChat";
import { AgentEnsip25Block, type VerifyAgentApiResponse } from "@/components/AgentEnsip25Block";

export function CuratorPageClient({ profile }: { profile: EnsProfile }) {
  const [config, setConfig] = useState<ArtistConfig | null>(null);
  const [verification, setVerification] = useState<VerifyAgentApiResponse | null>(null);

  const onVerification = useCallback((v: VerifyAgentApiResponse) => {
    setVerification(v);
  }, []);

  useEffect(() => {
    setConfig(loadArtistConfig(profile.name));
  }, [profile.name]);

  const context = useMemo(() => {
    if (!config) return null;
    const m = mockMetricsForContracts(config.contracts);
    return {
      artistEns: profile.name,
      artistStatement: config.statement,
      curatorEns: config.curatorEns.trim() || `curator.${profile.name}`,
      curatorPitch: config.curatorPitch,
      artSalesEth: m.artSalesGeneratedEth,
      collectorCount: m.collectorCount,
      contracts: config.contracts,
      agentEnsip25Headline: verification?.headline,
      agentEnsip25Verified: verification?.verified,
    };
  }, [config, profile.name, verification]);

  if (!config || !context) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-panel/50 p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Agent</p>
        <div className="mt-2">
          <AgentEnsip25Block
            artistEns={profile.name}
            agentId={config.agentId}
            onVerification={onVerification}
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          {config.curatorPitch.trim() ||
            `Official curator for ${profile.name}. Ask about their work, sales, and contracts.`}
        </p>
      </div>
      <CuratorChat context={context} />
    </div>
  );
}
