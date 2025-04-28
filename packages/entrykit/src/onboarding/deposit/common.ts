import { RelayChain } from "@reservoir0x/relay-sdk";
import { Chain, Hex } from "viem";

export type DepositMethod = "transfer" | "bridge" | "relay";

export type SourceChain = Chain & {
  // depositMethods: readonly DepositMethod[];
  // portalAddress: Hex | undefined;
  relayChain: RelayChain | undefined;
};
