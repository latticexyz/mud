import { MUDChain } from "@latticexyz/common/chains";

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
  },
  indexerUrl: "https://indexer.mud.rhodolitechain.com",
} satisfies MUDChain;
