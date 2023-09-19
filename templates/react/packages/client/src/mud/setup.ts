/*
 * This file sets up all the definitions required for a MUD client.
 */

import { createClientComponents } from "./createClientComponents";
import { setupNetwork } from "./setupNetwork";

export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup() {
  const network = await setupNetwork();
  const components = createClientComponents(network);

  return {
    network,
    components,
  };
}
