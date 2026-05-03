import type { Address, Hex, PublicClient } from "viem";
import { normalize } from "viem/ens";
import { encodeEvmRegistry7930 } from "@/lib/erc7930Evm";

const SEPOLIA_CHAIN_ID = 11_155_111;

/** Fixed “minimal demo registry” address used for ENSIP-25 keys when no on-chain registry is configured. */
export const DEMO_AGENT_REGISTRY_ADDRESS =
  "0x000000000000000000000000000000000000c0de" as Address;

export function canonEnsName(input: string): string | null {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;
  const withEth = raw.endsWith(".eth") ? raw : `${raw}.eth`;
  try {
    return normalize(withEth);
  } catch {
    return null;
  }
}

export type AgentRegistryRecord = {
  agentId: string;
  owner: Address;
  claimedEnsName: string;
  agentName: string;
  agentRole: string;
  metadataURI: string;
};

export function buildAgentRegistrationTextKey(registry7930: Hex, agentId: string): string {
  const id = String(agentId);
  if (id.includes("[") || id.includes("]")) {
    throw new Error("agentId must not contain [ or ]");
  }
  return `agent-registration[${registry7930.toLowerCase()}][${id}]`;
}

export function registry7930ForAddress(registryAddress: Address): Hex {
  return encodeEvmRegistry7930(SEPOLIA_CHAIN_ID, registryAddress);
}

export type Ensip25VerifyResult = {
  verified: boolean;
  /** Human-readable headline for UI */
  headline: string;
  agentRegistrationKey: string;
  ensTextValue: string | null;
  /** Registry row used for this check */
  record: AgentRegistryRecord;
  registry7930: Hex;
  registryAddress: Address;
  /** Why verification failed (if any) */
  reasons: string[];
};

export async function verifyEnsip25Sepolia(
  client: PublicClient,
  params: {
    registryAddress: Address;
    record: AgentRegistryRecord;
    /** Proof page ENS — must match registry claim for “full” demo consistency */
    artistEns: string;
  }
): Promise<Ensip25VerifyResult> {
  const reasons: string[] = [];
  const { record, artistEns, registryAddress } = params;

  const claimedN = canonEnsName(record.claimedEnsName);
  const artistN = canonEnsName(artistEns);

  if (!record.claimedEnsName.trim()) {
    reasons.push("Registry entry has no claimedEnsName.");
  } else if (!claimedN) {
    reasons.push("claimedEnsName is not a valid ENS name.");
  }

  if (claimedN && artistN && claimedN !== artistN) {
    reasons.push(
      `Registry claims ${record.claimedEnsName} but this proof page is for ${artistEns} (bidirectional mismatch).`
    );
  }

  const registry7930 = registry7930ForAddress(registryAddress);
  const agentRegistrationKey = buildAgentRegistrationTextKey(registry7930, record.agentId);

  let ensTextValue: string | null = null;
  const nameForResolver = claimedN ?? record.claimedEnsName.trim();
  if (nameForResolver) {
    try {
      ensTextValue = await client.getEnsText({
        name: nameForResolver,
        key: agentRegistrationKey,
      });
    } catch {
      ensTextValue = null;
    }
  }

  const ensSideOk = Boolean(ensTextValue && ensTextValue.trim().length > 0);
  if (!ensSideOk && claimedN) {
    reasons.push(
      `No non-empty ENS text at key agent-registration[…][${record.agentId}] on ${record.claimedEnsName || nameForResolver}.`
    );
  }
  if (!claimedN) {
    reasons.push("Cannot resolve ENSIP-25 text record without a valid claimed ENS name.");
  }

  const registrySideOk = Boolean(claimedN && artistN && claimedN === artistN);
  const verified = Boolean(claimedN && ensSideOk && registrySideOk);

  const displayClaim = record.claimedEnsName.trim() || artistEns || "(no name)";
  const headline = `Agent #${record.agentId} claims ${displayClaim} as its ENS identity${
    verified ? " (ENSIP-25 verified)" : " (not verified)"
  }.`;

  return {
    verified,
    headline,
    agentRegistrationKey,
    ensTextValue,
    record,
    registry7930,
    registryAddress,
    reasons,
  };
}
