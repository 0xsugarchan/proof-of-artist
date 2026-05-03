"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { EnsProfile } from "@/lib/ens";
import { shortAddress } from "@/lib/ens";
import type { ArtistConfig } from "@/lib/artistStore";
import { loadArtistConfig, parseContractInput, saveArtistConfig } from "@/lib/artistStore";
import { mockMetricsForContracts } from "@/lib/mockOnchain";
import { IdentityCard } from "@/components/IdentityCard";
import { MetricStrip } from "@/components/MetricStrip";
import { MockBanner } from "@/components/MockBanner";

type Props = { profile: EnsProfile };

export function DashboardEditor({ profile }: Props) {
  const ensKey = profile.name;
  const [config, setConfig] = useState<ArtistConfig | null>(null);
  const [contractLines, setContractLines] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const c = loadArtistConfig(ensKey);
    setConfig(c);
    setContractLines(c.contracts.join("\n"));
  }, [ensKey]);

  const persist = useCallback(
    (next: ArtistConfig) => {
      saveArtistConfig(ensKey, next);
      setConfig(next);
      setSavedAt(Date.now());
    },
    [ensKey]
  );

  const metrics = useMemo(() => {
    if (!config) return null;
    return mockMetricsForContracts(config.contracts);
  }, [config]);

  if (!config) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  function onSaveContracts() {
    if (!config) return;
    const lines = contractLines.split(/\n/);
    const contracts = [...new Set(lines.map(parseContractInput).filter(Boolean))] as ArtistConfig["contracts"];
    const next: ArtistConfig = {
      statement: config.statement,
      curatorEns: config.curatorEns,
      curatorPitch: config.curatorPitch,
      contracts,
    };
    persist(next);
  }

  function onSaveMeta() {
    if (!config) return;
    persist(config);
  }

  const publicHref = `/artist/${encodeURIComponent(ensKey)}`;
  const curatorHref = `/curator/${encodeURIComponent(ensKey)}`;

  return (
    <div className="space-y-8">
      <IdentityCard profile={profile} badge="Identity" />

      <MockBanner />

      {metrics ? (
        <MetricStrip
          metrics={[
            { label: "Art sales generated", value: `${metrics.artSalesGeneratedEth} ETH` },
            { label: "Collector count", value: String(metrics.collectorCount) },
            { label: "Top sale", value: `${metrics.topSaleEth} ETH` },
            { label: "Official contracts", value: String(config.contracts.length) },
          ]}
        />
      ) : null}

      <section className="space-y-3 rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
        <h2 className="text-sm font-medium">Official contracts</h2>
        <p className="text-xs text-muted">One Ethereum contract address per line.</p>
        <textarea
          value={contractLines}
          onChange={(e) => setContractLines(e.target.value)}
          rows={4}
          placeholder={"0x…\n0x…"}
          className="mt-2 w-full resize-y rounded-lg border border-line bg-ink px-3 py-2 font-mono text-xs text-zinc-100 outline-none ring-accent/30 focus:ring-2"
        />
        <button
          type="button"
          onClick={onSaveContracts}
          className="rounded-lg border border-line bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
        >
          Save contracts
        </button>
        <ul className="mt-2 space-y-1 font-mono text-[11px] text-zinc-500">
          {config.contracts.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
        <h2 className="text-sm font-medium">Artist statement</h2>
        <textarea
          value={config.statement}
          onChange={(e) => setConfig({ ...config, statement: e.target.value })}
          rows={4}
          placeholder="Short statement visitors see on your proof page."
          className="w-full resize-y rounded-lg border border-line bg-ink px-3 py-2 text-sm text-zinc-100 outline-none ring-accent/30 focus:ring-2"
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
        <h2 className="text-sm font-medium">Curator agent</h2>
        <p className="text-xs text-muted">Example: curator.{profile.name}</p>
        <input
          value={config.curatorEns}
          onChange={(e) => setConfig({ ...config, curatorEns: e.target.value })}
          placeholder="curator.sugarchan.eth"
          className="w-full rounded-lg border border-line bg-ink px-3 py-2 font-mono text-xs text-zinc-100 outline-none ring-accent/30 focus:ring-2"
        />
        <textarea
          value={config.curatorPitch}
          onChange={(e) => setConfig({ ...config, curatorPitch: e.target.value })}
          rows={3}
          placeholder="What this agent does for visitors (one or two sentences)."
          className="w-full resize-y rounded-lg border border-line bg-ink px-3 py-2 text-sm text-zinc-100 outline-none ring-accent/30 focus:ring-2"
        />
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onSaveMeta}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-ink hover:brightness-110"
        >
          Save statement & curator
        </button>
        {savedAt ? (
          <span className="self-center text-xs text-muted">Saved {new Date(savedAt).toLocaleTimeString()}</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 border-t border-line pt-6 sm:flex-row">
        <Link
          href={publicHref}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-panel px-4 text-sm font-medium text-zinc-100 hover:bg-zinc-900"
        >
          Open public proof page
        </Link>
        <Link
          href={curatorHref}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 px-4 text-sm font-medium text-accent hover:bg-accent/15"
        >
          Open curator Q&amp;A
        </Link>
      </div>

      <p className="font-mono text-[10px] text-zinc-600">
        Wallet: {profile.address} ({shortAddress(profile.address)})
      </p>
    </div>
  );
}
