import { RelayChain } from "@reservoir0x/relay-sdk";
import { Chain } from "viem";

export type SourceChain = Chain & {
  relayChain: RelayChain | undefined;
};
