import { type Address, type Hex, concatHex, hexToBytes, numberToHex, toHex, trim } from "viem";

/**
 * ERC-7930 interoperable address for an EVM registry (ENSIP-25).
 * @see https://eips.ethereum.org/EIPS/eip-7930 — version 1, chain type 0x0000, EIP-155 ref, 20-byte address.
 */
export function encodeEvmRegistry7930(chainId: number, registryAddress: Address): Hex {
  const chainRef = hexToBytes(trim(numberToHex(BigInt(chainId))));
  const addr = hexToBytes(registryAddress);
  if (addr.length !== 20) {
    throw new Error("Registry address must be 20 bytes");
  }
  return concatHex([
    "0x0001",
    "0x0000",
    numberToHex(chainRef.length, { size: 1 }),
    toHex(chainRef),
    numberToHex(20, { size: 1 }),
    registryAddress,
  ]);
}
