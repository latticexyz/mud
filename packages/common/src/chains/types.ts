import { ChainContract } from "viem";
import type { Chain } from "viem/chains";

// TODO: import from viem once available
export type RpcUrls = {
  http: readonly [string, ...string[]];
  webSocket?: readonly [string, ...string[]] | undefined;
};

export type MUDChain = Chain & {
  faucetUrl?: string;
  iconUrls?: readonly string[];
  rpcUrls?: Chain["rpcUrls"] & {
    erc4337Bundler?: RpcUrls | undefined;
  };
  contracts?: Chain["contracts"] & {
    gasTank?: ChainContract | undefined;
    portal?: {
      [sourceId: number]: ChainContract | undefined;
    };
  };
};
