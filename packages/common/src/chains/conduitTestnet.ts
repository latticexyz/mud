import type { Chain } from "@wagmi/chains";

export const conduitL2Testnet = {
  name: "Conduit L2",
  id: 901,
  network: "innocent-gold-porpoise",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["https://l2-innocent-gold-porpoise-6hdnogky9g.t.conduit.xyz"],
      webSocket: ["wss://l2-innocent-gold-porpoise-6hdnogky9g.t.conduit.xyz"],
    },
    public: {
      http: ["https://l2-innocent-gold-porpoise-6hdnogky9g.t.conduit.xyz"],
      webSocket: ["wss://l2-innocent-gold-porpoise-6hdnogky9g.t.conduit.xyz"],
    },
  },
  blockExplorers: {
    otterscan: {
      name: "Explorer L2",
      url: "https://explorerl2-innocent-gold-porpoise-6hdnogky9g.t.conduit.xyz",
    },
    default: {
      name: "Explorer L2",
      url: "https://explorerl2-innocent-gold-porpoise-6hdnogky9g.t.conduit.xyz",
    },
  },
  //   modeUrl: "https://mode.testnet-mud-services.linfra.xyz",
  //   faucetUrl: "https://faucet.testnet-mud-services.linfra.xyz",
} as const satisfies Chain;
