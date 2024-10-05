import { Chain } from "viem/chains";

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
} satisfies Chain;
