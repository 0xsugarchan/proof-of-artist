"use client";

import type { Address } from "viem";
import { isAddress } from "viem";

export type ArtistConfig = {
  /** Checksummed or lowercased contract addresses */
  contracts: Address[];
  statement: string;
  /** e.g. curator.sugarchan.eth */
  curatorEns: string;
  curatorPitch: string;
};

const defaultConfig = (): ArtistConfig => ({
  contracts: [],
  statement: "",
  curatorEns: "",
  curatorPitch: "",
});

export function artistStorageKey(ensName: string) {
  return `poa:artist:${ensName.toLowerCase()}`;
}

export function loadArtistConfig(ensName: string): ArtistConfig {
  if (typeof window === "undefined") return defaultConfig();
  try {
    const raw = window.localStorage.getItem(artistStorageKey(ensName));
    if (!raw) return defaultConfig();
    const parsed = JSON.parse(raw) as Partial<ArtistConfig>;
    const contracts = (parsed.contracts ?? [])
      .filter((c): c is Address => typeof c === "string" && isAddress(c))
      .map((c) => c as Address);
    return {
      contracts,
      statement: typeof parsed.statement === "string" ? parsed.statement : "",
      curatorEns: typeof parsed.curatorEns === "string" ? parsed.curatorEns : "",
      curatorPitch: typeof parsed.curatorPitch === "string" ? parsed.curatorPitch : "",
    };
  } catch {
    return defaultConfig();
  }
}

export function saveArtistConfig(ensName: string, config: ArtistConfig): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(artistStorageKey(ensName), JSON.stringify(config));
}

export function parseContractInput(line: string): Address | null {
  const t = line.trim();
  if (!t) return null;
  return isAddress(t) ? (t as Address) : null;
}
