import type { Chain } from "viem/chains";

export type MUDChain = Chain & {
  modeUrl?: string;
  faucetUrl?: string;
};
