import { Hex } from "viem";
import { anvil } from "viem/chains";
import { garnet, pyrope, redstone } from "@latticexyz/common/chains";

const testWorlds = {
  // TODO: get this from somewhere else, like playground deploy output
  [anvil.id]: "0x60e7e3caed67b9d2cca14519b6cd7700a7d4ee66",
  [redstone.id]: "0xf75b1b7bdb6932e487c4aa8d210f4a682abeacf0",
  [garnet.id]: "0x1d1BBb7e359a7425428adBe799d84601B221b4E8",
  [pyrope.id]: "0xe8d5C603b4A501B6B5EAB46a14dA05f38e44F64f",
} as Partial<Record<string, Hex>>;

const searchParams = new URLSearchParams(window.location.search);
export const chainId = parseInt(searchParams.get("chainId") ?? "") || anvil.id;

const testWorldAddress = testWorlds[chainId];
if (!testWorldAddress) {
  throw new Error(`EntryKit playground is not configured with a test world address for chain ID ${chainId}`);
}

export const worldAddress = testWorldAddress;
