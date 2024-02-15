import { createPublicClient, fallback, webSocket, http, type ClientConfig } from "viem";
import { configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";
import { transportObserver } from "@latticexyz/common";
import { type MUDChain } from "@latticexyz/common/chains";

export function getWagmiConfig(chain: MUDChain) {
  const clientOptions = {
    chain,
    transport: transportObserver(fallback([webSocket(), http()])),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  const { chains } = configureChains([chain], [publicProvider()]);

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: [
      new InjectedConnector({
        chains,
      }),
    ],
    publicClient,
  });

  return wagmiConfig;
}
