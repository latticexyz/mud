import { MUDChain } from "@latticexyz/common/chains";

export const redstoneHolesky = {
  id: 17001,
  name: "Redstone Holesky",
  network: "redstone-holesky",
  nativeCurrency: {
    decimals: 18,
    name: "Holesky Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.holesky.redstone.xyz"],
      webSocket: ["wss://rpc.holesky.redstone.xyz/ws"],
    },
    public: {
      http: ["https://rpc.holesky.redstone.xyz"],
      webSocket: ["wss://rpc.holesky.redstone.xyz/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.holesky.redstone.xyz",
    },
  },
} as const satisfies MUDChain;
