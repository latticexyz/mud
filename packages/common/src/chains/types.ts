import type { Chain } from "viem/chains";

export type MUDChain = Chain & {
  iconUrls?: readonly string[];
  indexerUrl?: string;
  mudIdUrl?: string;
  /** @deprecated */
  faucetUrl?: string;
};
