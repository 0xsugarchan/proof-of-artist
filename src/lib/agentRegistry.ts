import { type Address, isAddress } from "viem";
import { sepoliaPublicClient } from "@/lib/ens";
import type { AgentRegistryRecord } from "@/lib/ensip25";
import { canonEnsName, DEMO_AGENT_REGISTRY_ADDRESS } from "@/lib/ensip25";

const demoRegistryAbi = [
  {
    type: "function",
    name: "agents",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [
      { name: "owner", type: "address" },
      { name: "claimedEnsName", type: "string" },
      { name: "agentName", type: "string" },
      { name: "agentRole", type: "string" },
      { name: "metadataURI", type: "string" },
    ],
  },
] as const;

function readRegistryAddress(): Address | null {
  const raw = process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS?.trim();
  if (!raw || !isAddress(raw)) return null;
  return raw as Address;
}

/** Off-chain demo row when no contract is deployed (Sepolia hackathon). */
function demoAgentRecord(agentId: string, artistEnsForClaim: string): AgentRegistryRecord {
  const claimed = canonEnsName(artistEnsForClaim) ?? "";
  return {
    agentId,
    owner: "0x0000000000000000000000000000000000000001",
    claimedEnsName: claimed,
    agentName: "Curator Agent",
    agentRole: "artist-curator",
    metadataURI: "https://example.invalid/api/agents/1.json",
  };
}

export type FetchAgentResult =
  | { ok: true; source: "chain" | "demo"; address: Address; record: AgentRegistryRecord }
  | { ok: false; error: string };

/**
 * Load agent row from Sepolia `agents(uint256)` when env is set, else demo listing keyed to this artist ENS.
 */
export async function fetchAgentRegistryRecord(
  agentId: string,
  artistEnsForDemoClaim: string
): Promise<FetchAgentResult> {
  const id = String(agentId).trim() || "1";

  const registryAddr = readRegistryAddress();
  if (!registryAddr) {
    return {
      ok: true,
      source: "demo",
      address: DEMO_AGENT_REGISTRY_ADDRESS,
      record: demoAgentRecord(id, artistEnsForDemoClaim),
    };
  }

  try {
    const row = await sepoliaPublicClient.readContract({
      address: registryAddr,
      abi: demoRegistryAbi,
      functionName: "agents",
      args: [BigInt(id)],
    });
    const [owner, claimedEnsName, agentName, agentRole, metadataURI] = row;
    return {
      ok: true,
      source: "chain",
      address: registryAddr,
      record: {
        agentId: id,
        owner,
        claimedEnsName,
        agentName,
        agentRole,
        metadataURI,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "readContract failed",
    };
  }
}
