import { chainConfig } from "viem/op-stack";
import { MUDChain } from "./types";

const sourceId = 17001;

export const rhodolite = {
  ...chainConfig,
  name: "Rhodolite Devnet",
  testnet: true,
  id: 17420,
  sourceId,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.rhodolitechain.com"],
    },
  },
  iconUrls: ["https://redstone.xyz/chain-icons/rhodolite.png"],
  indexerUrl: "https://indexer.mud.rhodolitechain.com",
} as const satisfies MUDChain;
