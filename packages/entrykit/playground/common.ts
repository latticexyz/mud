import { Hex } from "viem";
import { anvil } from "viem/chains";

const testWorlds = {
  [anvil.id]: "0x6Eb9682FE93c6fE4346e0a1e70bC049Aa18CC0CA",
} as Partial<Record<string, Hex>>;

const searchParams = new URLSearchParams(window.location.search);
export const chainId = parseInt(searchParams.get("chainId") ?? "") || anvil.id;

const testWorldAddress = testWorlds[chainId];
if (!testWorldAddress) {
  throw new Error(`EntryKit playground is not configured with a test world address for chain ID ${chainId}`);
}

export const worldAddress = testWorldAddress;
