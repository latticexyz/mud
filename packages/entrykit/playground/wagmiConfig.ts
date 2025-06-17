import { Chain, http } from "viem";
import { anvil, mainnet } from "viem/chains";
import { createWagmiConfig } from "../src/createWagmiConfig";
import { chainId } from "./common";
import { garnet } from "@latticexyz/common/chains";
import { wiresaw } from "@latticexyz/common/internal";

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

const chains = [mainnet, garnetWithPaymaster, anvilWithPaymaster] as const satisfies Chain[];

const transports = {
  [mainnet.id]: http(),
  [anvil.id]: http(),
  [garnet.id]: wiresaw(),
} as const;

export const wagmiConfig = createWagmiConfig({
  chainId,
  walletConnectProjectId: "3f1000f6d9e0139778ab719fddba894a",
  appName: document.title,
  chains,
  transports,
  pollingInterval: {
    [anvil.id]: 500,
    [garnet.id]: 2000,
  },
});
