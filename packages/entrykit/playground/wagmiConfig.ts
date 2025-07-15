import { Chain, http } from "viem";
import { anvil, redstone, mainnet } from "viem/chains";
import { createWagmiConfig } from "../src/createWagmiConfig";
import { chainId } from "./common";
import { garnet, pyrope } from "@latticexyz/common/chains";
import { getDefaultConnectors } from "../src/getDefaultConnectors";
import { porto } from "./porto";

const appConfig = {
  walletConnectProjectId: "3f1000f6d9e0139778ab719fddba894a",
  appName: document.title,
};

const redstoneWithPaymaster = {
  ...redstone,
  rpcUrls: {
    ...redstone.rpcUrls,
    wiresaw: {
      http: ["https://wiresaw.redstonechain.com"],
      webSocket: ["wss://wiresaw.redstonechain.com"],
    },
    bundler: {
      http: ["https://rpc.redstonechain.com"],
      webSocket: ["wss://rpc.redstonechain.com"],
    },
  },
  contracts: {
    quarryPaymaster: {
      address: "0x2d70F1eFFbFD865764CAF19BE2A01a72F3CE774f",
    },
  },
};

const garnetWithPaymaster = {
  ...garnet,
  rpcUrls: {
    ...garnet.rpcUrls,
    wiresaw: {
      http: ["https://wiresaw.garnetchain.com"],
      webSocket: ["wss://wiresaw.garnetchain.com"],
    },
  },
  contracts: {
    quarryPaymaster: {
      address: "0x0528104d96672dfdF47B92f809A32e7eA11Ee8d9",
    },
  },
};

const anvilWithPaymaster = {
  ...anvil,
  rpcUrls: {
    ...anvil.rpcUrls,
    default: {
      http: ["https://anvil.tunnel.offchain.dev"],
      webSocket: ["wss://anvil.tunnel.offchain.dev"],
    },
    // bundler: {
    //   http: ["http://127.0.0.1:4337"],
    // },
    // TODO: automatically grant allowance in anvil instead of requiring the service
    // quarryPassIssuer: {
    //   http: ["http://127.0.0.1:3003/rpc"],
    // },
  },
  contracts: {
    // quarryPaymaster: {
    //   address: "0xf03E61E7421c43D9068Ca562882E98d1be0a6b6e",
    // },
    paymaster: {
      address: "0xf03E61E7421c43D9068Ca562882E98d1be0a6b6e",
    },
  },
};

const pyropeWithPaymaster = {
  ...pyrope,
  contracts: {
    quarryPaymaster: {
      address: "0xD40C9cFc97b855B2183D7e1c8925edF77C309b85",
    },
  },
};

const chains = [
  // mainnet,
  // garnetWithPaymaster,
  anvilWithPaymaster,
  // redstoneWithPaymaster,
  // pyropeWithPaymaster,
] as const satisfies Chain[];

const transports = {
  // [mainnet.id]: http(),
  [anvilWithPaymaster.id]: http(),
  // [garnetWithPaymaster.id]: wiresaw(),
  // [redstoneWithPaymaster.id]: wiresaw(),
  // [pyropeWithPaymaster.id]: http(),
} as const;

// TODO: remove once we bump viem to include https://github.com/wevm/viem/commit/b55ec5a6ee448367d3da844303a6f1a5bc71514a
const pollingInterval = {
  // [mainnet.id]: 2000,
  [anvilWithPaymaster.id]: 500,
  // [garnetWithPaymaster.id]: 2000,
  // [redstoneWithPaymaster.id]: 2000,
  // [pyropeWithPaymaster.id]: 2000,
} as const;

const connectors = [
  // idConnector(),
  porto(),
  ...getDefaultConnectors(appConfig),
];

export const wagmiConfig = createWagmiConfig({
  ...appConfig,
  chainId,
  chains,
  transports,
  pollingInterval,
  connectors,
});
