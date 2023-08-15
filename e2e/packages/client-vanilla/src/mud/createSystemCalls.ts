import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(network: SetupNetworkResult, components: ClientComponents) {
  return {
    // TODO
  };
}
