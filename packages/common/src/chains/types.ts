import type { Chain } from "viem/chains";

export type MUDChain = Chain & {
  faucetUrl?: string;
  erc4337BundlerUrl?: {
    http: string;
    webSocket?: string;
  };
};
