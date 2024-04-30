import type { Chain } from "viem/chains";

export type MUDChain = Chain & {
  indexerUrl?: string;
  faucetUrl?: string;
};
