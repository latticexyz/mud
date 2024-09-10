export const garnetHolesky = {
  id: 17069,
  network: "garnet-holesky",
  name: "Garnet Holesky",
  nativeCurrency: { name: "Garnet Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.garnetchain.com/"],
    },
    public: {
      http: ["https://rpc.garnetchain.com/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.garnetchain.com/",
    },
  },
  testnet: true,
};
