"use client";

import { useEffect, useMemo, useState } from "react";
import type { EnsProfile } from "@/lib/ens";
import type { ArtistConfig } from "@/lib/artistStore";
import { loadArtistConfig } from "@/lib/artistStore";
import { mockMetricsForContracts } from "@/lib/mockOnchain";
import { CuratorChat } from "@/components/CuratorChat";

export function CuratorPageClient({ profile }: { profile: EnsProfile }) {
  const [config, setConfig] = useState<ArtistConfig | null>(null);

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
    };
  }, [config, profile.name]);

  if (!config || !context) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-panel/50 p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Agent</p>
        <p className="mt-1 font-mono text-sm text-zinc-200">{context.curatorEns}</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          {context.curatorPitch.trim() ||
            `Official curator for ${profile.name}. Ask about their work, sales, and contracts.`}
        </p>
      </div>
      <CuratorChat context={context} />
    </div>
  );
}
