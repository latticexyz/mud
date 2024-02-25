import { createConfig } from "wagmi";
import { setupNetwork } from "./setupNetwork";

export async function setup() {
  const mud = await setupNetwork();

  const wagmiConfig = createConfig({
    chains: [mud.publicClient.chain],
    client: () => mud.publicClient,
  });

  return {
    mud,
    wagmiConfig,
  };
}
