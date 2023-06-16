import type { Chain } from "@wagmi/chains";

export type MUDChain = Chain & {
  modeUrl?: string;
  faucetUrl?: string;
};
