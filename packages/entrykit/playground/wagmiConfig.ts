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
  sepolia,
  baseSepolia,
] as const satisfies Chain[];

const transports = {
  // [anvil.id]: http(),
  // [redstone.id]: http(),
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
    // [redstone.id]: 500,
    [pyrope.id]: 500,
    [sepolia.id]: 500,
    [baseSepolia.id]: 500,
  },
});
