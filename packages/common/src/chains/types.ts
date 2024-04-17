import { ChainContract } from "viem";
import type { Chain } from "viem/chains";

export type MUDChain = Chain & {
  faucetUrl?: string;
  erc4337BundlerUrl?: {
    http: string;
    webSocket?: string;
  };
  rpcUrls?: Chain["rpcUrls"] & {
    // TODO: replace with ChainRpcURLs from viem once exported
    readonly erc4337Bundler?: {
      http: readonly string[];
      webSocket?: readonly string[] | undefined;
    };
  };
  contracts?: Chain["contracts"] & {
    readonly gasTank?: ChainContract | undefined;
  };
};
