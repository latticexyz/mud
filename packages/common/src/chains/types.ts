import { ChainContract } from "viem";
import type { Chain } from "viem/chains";

export type MUDChain = Chain & {
  faucetUrl?: string;
  erc4337BundlerUrl?: {
    http: string;
    webSocket?: string;
  };
  contracts?: Chain["contracts"] & {
    readonly gasTank?: ChainContract;
  };
};
