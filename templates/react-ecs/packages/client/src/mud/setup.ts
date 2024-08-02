/*
 * This file sets up all the definitions required for a MUD client.
 */

import { SetupNetworkResult, setupNetwork } from "./setupNetwork";

export type SetupResult = { network: SetupNetworkResult };

export async function setup(): Promise<SetupResult> {
  const network = await setupNetwork();

  return {
    network,
  };
}
