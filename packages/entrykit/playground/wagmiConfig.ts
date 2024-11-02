import { Chain, webSocket } from "viem";
import { anvil } from "viem/chains";
import { createWagmiConfig } from "../src/createWagmiConfig";
import { chainId } from "./common";

const chains = [
  {
    ...anvil,
    rpcUrls: {
      ...anvil.rpcUrls,
      // TODO: automatically grant allowance in anvil instead of requiring the service
      quarryPassIssuer: {
        http: ["http://127.0.0.1:3003/rpc"],
      },
    },
    contracts: {
      // TODO: make optional in entrykit?
      quarryPaymaster: {
        address: "0x8D8b6b8414E1e3DcfD4168561b9be6bD3bF6eC4B",
      },
    },
  },
] as const satisfies Chain[];

const transports = {
  [anvil.id]: webSocket(),
} as const;

export const wagmiConfig = createWagmiConfig({
  chainId,
  walletConnectProjectId: "14ce88fdbc0f9c294e26ec9b4d848e44",
  appName: document.title,
  chains,
  transports,
  pollingInterval: {
    [anvil.id]: 2000,
  },
});
