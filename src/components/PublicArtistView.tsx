"use client";

import { useEffect, useMemo, useState } from "react";
import type { EnsProfile } from "@/lib/ens";
import type { ArtistConfig } from "@/lib/artistStore";
import { artistStorageKey, loadArtistConfig } from "@/lib/artistStore";
import { mockMetricsForContracts } from "@/lib/mockOnchain";
import { IdentityCard } from "@/components/IdentityCard";
import { MetricStrip } from "@/components/MetricStrip";
import { FeaturedWorks } from "@/components/FeaturedWorks";
import { MockBanner } from "@/components/MockBanner";
import { AgentEnsip25Block } from "@/components/AgentEnsip25Block";

export function PublicArtistView({ profile }: { profile: EnsProfile }) {
  const [config, setConfig] = useState<ArtistConfig | null>(null);

  useEffect(() => {
    setConfig(loadArtistConfig(profile.name));
    const onStorage = (e: StorageEvent) => {
      if (e.key === artistStorageKey(profile.name)) {
        setConfig(loadArtistConfig(profile.name));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [profile.name]);

  const metrics = useMemo(() => {
    if (!config) return null;
    return mockMetricsForContracts(config.contracts);
  }, [config]);

  if (!config || !metrics) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <IdentityCard profile={profile} />
      <MockBanner />
      <MetricStrip
        metrics={[
          { label: "Art sales generated", value: `${metrics.artSalesGeneratedEth} ETH` },
          { label: "Collector count", value: String(metrics.collectorCount) },
          { label: "Featured works", value: String(metrics.featured.length) },
          { label: "Top sale", value: `${metrics.topSaleEth} ETH` },
        ]}
      />

      {config.statement.trim() ? (
        <section className="rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted">Statement</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{config.statement}</p>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted">Featured works</h2>
        <FeaturedWorks items={metrics.featured} />
      </section>

      <section className="rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted">Official contracts</h2>
        {config.contracts.length === 0 ? (
          <p className="mt-2 text-sm text-muted">None listed yet.</p>
        ) : (
          <ul className="mt-2 space-y-1 font-mono text-[11px] text-zinc-400 break-all">
            {config.contracts.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-accent/25 bg-accent/5 p-4 sm:p-5">
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-accent">AI agent (ENSIP-25)</h2>
        <div className="mt-2">
          <AgentEnsip25Block artistEns={profile.name} agentId={config.agentId} />
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted">Curator label</p>
        <p className="mt-1 font-mono text-xs text-zinc-300">
          {config.curatorEns.trim() || `curator.${profile.name}`}
        </p>
        {config.curatorPitch.trim() ? (
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{config.curatorPitch}</p>
        ) : (
          <p className="mt-2 text-sm text-muted">This agent answers questions about the artist.</p>
        )}
      </section>
    </div>
  );
}
