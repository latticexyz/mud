/*
 * This file sets up all the definitions required for a MUD client.
 */

import { createConfig } from "wagmi";
import { setupNetwork } from "./setupNetwork";

export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup() {
  const network = await setupNetwork();

  // Create a Wagmi config for an external wallet connection.
  // https://wagmi.sh/react/api/createConfig
  const wagmiConfig = createConfig({
    chains: [network.publicClient.chain],
    client: () => network.publicClient,
  });

  return {
    network,
    wagmiConfig,
  };
}
