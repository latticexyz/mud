/*
 * Creates components for use by the client.
 *
 * By default it returns the components from setupNetwork.ts.
 * Add or override components here as needed.
 */
import { SetupNetworkResult } from "./setupNetwork";

export type ClientComponents = ReturnType<typeof createClientComponents>;

export function createClientComponents({ components }: SetupNetworkResult) {
  return {
    ...components,
    // add your client components or overrides here
  };
}
