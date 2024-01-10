/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import { Hex } from "viem";
import { SetupNetworkResult } from "./setupNetwork";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { tables, useStore, worldContract, waitForTransaction }: SetupNetworkResult
) {

  return {};
}
