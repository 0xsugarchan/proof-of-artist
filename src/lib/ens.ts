import { createPublicClient, defineChain, http, isAddress, type Address } from "viem";
import { normalize } from "viem/ens";

/** Sepolia with ENS contracts — required for `getEnsAddress` / avatar / text. */
const sepolia = defineChain({
  id: 11_155_111,
  name: "Sepolia",
  nativeCurrency: { decimals: 18, name: "Sepolia Ether", symbol: "ETH" },
  rpcUrls: { default: { http: ["https://rpc.sepolia.org"] } },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 751_532,
    },
    ensUniversalResolver: {
      address: "0xeeeeeeee14d718c2b47d9923deab1335e144eeee",
      blockCreated: 8_928_790,
    },
  },
  testnet: true,
});

const rpcUrl = process.env.NEXT_PUBLIC_ETH_RPC_URL;

/** Sepolia JSON-RPC client (ENS + optional registry reads). */
export const sepoliaPublicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
});

export type EnsProfile = {
  name: string;
  address: Address;
  avatar: string | null;
  /** Primary display name if set */
  displayName: string | null;
  /** ENS text record: com.twitter (X/Twitter handle) */
  xHandle: string | null;
};

export function normalizeEnsInput(input: string): string | null {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;
  const withEth = raw.endsWith(".eth") ? raw : `${raw}.eth`;
  try {
    return normalize(withEth);
  } catch {
    return null;
  }
}

export async function resolveEnsProfile(
  input: string
): Promise<{ ok: true; profile: EnsProfile } | { ok: false; error: string }> {
  const name = normalizeEnsInput(input);
  if (!name) {
    return { ok: false, error: "Invalid ENS name." };
  }

  try {
    const address = await sepoliaPublicClient.getEnsAddress({ name });
    if (!address || address === "0x0000000000000000000000000000000000000000") {
      return { ok: false, error: "Name did not resolve to a wallet." };
    }

    const [avatar, displayName, xHandle, legacyTwitter] = await Promise.all([
      sepoliaPublicClient.getEnsAvatar({ name }).catch(() => null),
      sepoliaPublicClient.getEnsText({ name, key: "name" }).catch(() => null),
      sepoliaPublicClient.getEnsText({ name, key: "com.twitter" }).catch(() => null),
      sepoliaPublicClient.getEnsText({ name, key: "vnd.twitter" }).catch(() => null),
    ]);
    const handle = (xHandle?.trim() || legacyTwitter?.trim() || "") || null;

    return {
      ok: true,
      profile: {
        name,
        address,
        avatar: avatar ?? null,
        displayName: displayName?.trim() || null,
        xHandle: handle,
      },
    };
  } catch {
    return { ok: false, error: "Could not resolve ENS. Check RPC or name." };
  }
}

export function shortAddress(addr: string): string {
  if (!isAddress(addr)) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
