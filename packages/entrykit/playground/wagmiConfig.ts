import { Chain, http } from "viem";
import { sepolia, baseSepolia } from "viem/chains";
import { createWagmiConfig } from "../src/createWagmiConfig";
import { chainId } from "./common";
import { pyrope } from "@latticexyz/common/chains";

const chains = [
  {
    ...pyrope,
    rpcUrls: {
      ...pyrope.rpcUrls,
      // quarryPassIssuer: {
      // http: ["https://rpc.pyropechain.com"],
      // },
    },
    // ...anvil,
    // rpcUrls: {
    //   ...anvil.rpcUrls,
    // bundler: {
    //   http: ["http://127.0.0.1:4337"],
    // },
    // TODO: automatically grant allowance in anvil instead of requiring the service
    // quarryPassIssuer: {
    //   http: ["http://127.0.0.1:3003/rpc"],
    // },
    // },
    contracts: {
      quarryPaymaster: {
        address: "0xEe87F5F13A3e3dFb82A0e7f41ef09eC4e7c8E0C1", // without 0.1 ETH limit
      },
      // quarryPaymaster: {
      //   address: "0x8D8b6b8414E1e3DcfD4168561b9be6bD3bF6eC4B",
      // },
      // paymaster: {
      //   address: "0xf03E61E7421c43D9068Ca562882E98d1be0a6b6e",
      // },
    },
  },
  sepolia,
  baseSepolia,
] as const satisfies Chain[];

const transports = {
  // [anvil.id]: http(),
  [pyrope.id]: http(),
  [sepolia.id]: http(),
  [baseSepolia.id]: http(),
} as const;

export const wagmiConfig = createWagmiConfig({
  chainId,
  walletConnectProjectId: "14ce88fdbc0f9c294e26ec9b4d848e44",
  appName: document.title,
  chains,
  transports,
  pollingInterval: {
    // [anvil.id]: 500,
  },
});
