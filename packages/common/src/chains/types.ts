import type { Chain } from "viem/chains";

export type MUDChain = Chain & {
  faucetUrl?: string;
};
