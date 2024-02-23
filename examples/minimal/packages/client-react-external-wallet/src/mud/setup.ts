import { createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { setupNetwork } from "./setupNetwork";

export async function setup() {
  const mud = await setupNetwork();

  const wagmiConfig = createConfig({
    chains: [mud.publicClient.chain],
    connectors: [injected()],
    client: () => mud.publicClient,
  });

  return {
    mud,
    wagmiConfig,
  };
}
