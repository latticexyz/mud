/*
 * This file sets up all the definitions required for a MUD client.
 */

/*
 * Import the code that does various types of setup.
 */
import { createClientComponents } from "./createClientComponents";
import { createSystemCalls } from "./createSystemCalls";
import { setupNetwork } from "./setupNetwork";

/*
 * The type definition for the return type of setup.
 * The result is an Awaited (https://www.typescriptlang.org/docs/handbook/utility-types.html#awaitedtype),
 * which means a result that may not be immediately available.
 *
 * The Awaited result is of type ReturnType<typeof setup>, which
 * means that TypeScript will see the type that the setup function
 * returns and use that.
 */
export type SetupResult = Awaited<ReturnType<typeof setup>>;

/*
 * This is the setup function that is called from the client code
 * (index.ts or index.tsx, depending on the client framework).
 */
export async function setup() {
  /*
   * Get the network information, the components, and the system calls from the imported code.
   */
  const network = await setupNetwork();
  const components = createClientComponents(network);
  const systemCalls = createSystemCalls(network, components);

  /*
   * Return all of this information.
   * This structure's syntax is shorthand for:
   *
   *   {
   *     "network": network,
   *     "components": components,
   *     "systemCalls": systemCalls
   *   }
   */

  return {
    network,
    components,
    systemCalls,
  };
}
