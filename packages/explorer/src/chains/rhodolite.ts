import { Chain } from "viem/chains";
import { chainConfig } from "viem/op-stack";

const sourceId = 17000; // Holesky
export const rhodolite = {
  id: 17420,
  name: "Rhodolite",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.rhodolitechain.com"],
    },
    erc4337: {
      http: ["http://79.127.239.88:54337"],
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l1StandardBridge: {
      [sourceId]: {
        address: "0x760eDdF161B8b1540ce6516471f348093e8e71ab",
        blockCreated: 2415540,
      },
    },
  },
} satisfies Chain;
