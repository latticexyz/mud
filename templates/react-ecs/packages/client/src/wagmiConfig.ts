import { Chain, http, webSocket } from "viem";
import { anvil } from "viem/chains";
import { createWagmiConfig } from "@latticexyz/entrykit/internal";
import { garnet, pyrope, redstone } from "@latticexyz/common/chains";
import { chainId } from "./common";

export const chains = [
  redstone,
  garnet,
  pyrope,
  {
    ...anvil,
    contracts: {
      ...anvil.contracts,
      paymaster: {
        address: "0xf03E61E7421c43D9068Ca562882E98d1be0a6b6e",
      },
    },
    blockExplorers: {
      default: {} as never,
      worldsExplorer: {
        name: "MUD Worlds Explorer",
        url: "http://localhost:13690/anvil/worlds",
      },
    },
  },
] as const satisfies Chain[];

export const transports = {
  [anvil.id]: webSocket(),
  [garnet.id]: http(),
  [pyrope.id]: http(),
  [redstone.id]: http(),
} as const;

export const wagmiConfig = createWagmiConfig({
  chainId,
  // TODO: swap this with another default project ID or leave empty
  walletConnectProjectId: "3f1000f6d9e0139778ab719fddba894a",
  appName: document.title,
  chains,
  transports,
  pollingInterval: {
    [anvil.id]: 2000,
    [garnet.id]: 2000,
    [pyrope.id]: 2000,
    [redstone.id]: 2000,
  },
});
