import { Chain, http } from "viem";
import { anvil, mainnet } from "viem/chains";
import { createWagmiConfig } from "../src/createWagmiConfig";
import { chainId } from "./common";

const chains = [
  mainnet,
  {
    ...anvil,
    rpcUrls: {
      // ...anvil.rpcUrls,
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
      //   address: "0x8D8b6b8414E1e3DcfD4168561b9be6bD3bF6eC4B",
      // },
      paymaster: {
        address: "0xf03E61E7421c43D9068Ca562882E98d1be0a6b6e",
      },
    },
  },
] as const satisfies Chain[];

const transports = {
  [mainnet.id]: http(),
  [anvil.id]: http(),
} as const;

export const wagmiConfig = createWagmiConfig({
  chainId,
  walletConnectProjectId: "3f1000f6d9e0139778ab719fddba894a",
  appName: document.title,
  chains,
  transports,
  pollingInterval: {
    [anvil.id]: 500,
  },
});
