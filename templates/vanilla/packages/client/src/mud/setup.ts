/*
 * This file sets up all the definitions required for a MUD client.
 */

import { ClientComponents, createClientComponents } from "./createClientComponents";
import { SystemCalls, createSystemCalls } from "./createSystemCalls";
import { SetupNetworkResult, setupNetwork } from "./setupNetwork";

export type SetupResult = { network: SetupNetworkResult; components: ClientComponents; systemCalls: SystemCalls };

export async function setup(): Promise<SetupResult> {
  const network = await setupNetwork();
  const components = createClientComponents(network);
  const systemCalls = createSystemCalls(network, components);

  return {
    network,
    components,
    systemCalls,
  };
}
