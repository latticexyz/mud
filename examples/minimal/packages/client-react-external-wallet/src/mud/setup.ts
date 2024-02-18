import { createConfig } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { setupNetwork } from "./setupNetwork";

export async function setup() {
  const mud = await setupNetwork();

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: [
      new InjectedConnector({
        chains: [mud.publicClient.chain],
      }),
    ],
    publicClient: mud.publicClient,
  });

  return {
    mud,
    wagmiConfig,
  };
}
