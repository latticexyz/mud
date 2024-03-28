import { fallback, webSocket, http, type ClientConfig } from "viem";
import { transportObserver } from "@latticexyz/common";
import { type MUDChain } from "@latticexyz/common/chains";

// https://viem.sh/docs/clients/public#parameters
export function createViemClientConfig(chain: MUDChain) {
  return {
    chain,
    transport: transportObserver(fallback([webSocket(), http()])),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;
}
