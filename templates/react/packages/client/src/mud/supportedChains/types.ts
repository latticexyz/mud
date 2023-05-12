import { Chain } from "@wagmi/chains";

export type MudChain = Chain & { modeUrl?: string; faucetUrl?: string };
