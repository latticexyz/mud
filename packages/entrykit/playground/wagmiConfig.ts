import { Chain, webSocket } from "viem";
import { createWagmiConfig } from "../src/createWagmiConfig";
import { chainId } from "./common";
import { garnet } from "@latticexyz/common/chains";

const chains = [
  {
    ...garnet,
    rpcUrls: {
      ...garnet.rpcUrls,
      wiresaw: {
        http: ["https://wiresaw.garnetchain.com"],
        webSocket: ["wss://wiresaw.garnetchain.com"],
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
      quarryPaymaster: {
        address: "0x0528104d96672dfdF47B92f809A32e7eA11Ee8d9",
      },
      // paymaster: {
      //   address: "0xf03E61E7421c43D9068Ca562882E98d1be0a6b6e",
      // },
    },
  },
] as const satisfies Chain[];

const transports = {
  [garnet.id]: webSocket(),
} as const;

export const wagmiConfig = createWagmiConfig({
  chainId,
  walletConnectProjectId: "14ce88fdbc0f9c294e26ec9b4d848e44",
  appName: document.title,
  chains,
  transports,
  pollingInterval: {
    [garnet.id]: 2000,
  },
});
