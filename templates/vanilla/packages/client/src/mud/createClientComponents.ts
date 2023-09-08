/*
 * Creates components for use by the client.
 *
 * By default it only returns the components from
 * setupNetwork.ts, but you can change that if you need more
 * components.
 */
import { SetupNetworkResult } from "./setupNetwork";

export type ClientComponents = ReturnType<typeof createClientComponents>;

export function createClientComponents({ components }: SetupNetworkResult) {
  return {
    ...components,
    // add your client components or overrides here
  };
}
