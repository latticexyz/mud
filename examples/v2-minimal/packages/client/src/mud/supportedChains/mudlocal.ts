import { MudChain } from "./types";

// Temporary chain config so I can see v2 requests separately
const mudlocal = {
  id: 31337,
  name: "MUD Local",
  network: "mudlocal",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545/?mud=v2"],
      webSocket: ["ws://127.0.0.1:8545/?mud=v2"],
    },
    public: {
      http: ["http://127.0.0.1:8545/?mud=v2"],
      webSocket: ["ws://127.0.0.1:8545/?mud=v2"],
    },
  },
  modeUrl: undefined,
  faucetUrl: undefined,
} as const satisfies MudChain;

export default mudlocal;
