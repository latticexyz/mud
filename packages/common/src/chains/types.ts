import type { Chain } from "viem/chains";

export type MUDChain = Chain & {
  iconUrls?: readonly string[];
  indexerUrl?: string;
  /** @deprecated */
  faucetUrl?: string;
};
