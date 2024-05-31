import { Address, Hex, encodeAbiParameters, keccak256 } from "viem";
import { entryPointDepositsSlot } from "../common";

// TODO: move this to gas-tank package or similar

export function getEntryPointDepositSlot(gasTankAddress: Address): Hex {
  return keccak256(
    encodeAbiParameters([{ type: "address" }, { type: "uint256" }], [gasTankAddress, entryPointDepositsSlot]),
  );
}
