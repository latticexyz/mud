import { Hex } from "viem";
import { anvil, redstone } from "viem/chains";

const testWorlds = {
  // TODO: get this from somewhere else, like playground deploy output
  [anvil.id]: "0x60e7e3caed67b9d2cca14519b6cd7700a7d4ee66",
  [redstone.id]: "0x60e7e3caed67b9d2cca14519b6cd7700a7d4ee66",
} as Partial<Record<string, Hex>>;

const searchParams = new URLSearchParams(window.location.search);
export const chainId = parseInt(searchParams.get("chainId") ?? "") || anvil.id;

const testWorldAddress = testWorlds[chainId];
if (!testWorldAddress) {
  throw new Error(`EntryKit playground is not configured with a test world address for chain ID ${chainId}`);
}

export const worldAddress = testWorldAddress;
