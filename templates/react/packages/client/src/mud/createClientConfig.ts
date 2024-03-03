import { fallback, webSocket, http, type ClientConfig } from "viem";
import { transportObserver } from "@latticexyz/common";
import { type MUDChain } from "@latticexyz/common/chains";

export function createClientConfig(chain: MUDChain) {
  return {
    chain,
    transport: transportObserver(fallback([webSocket(), http()])),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;
}
