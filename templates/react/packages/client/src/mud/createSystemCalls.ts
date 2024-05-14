/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import { Hex } from "viem";
import { SetupNetworkResult } from "./setupNetwork";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  /*
   * The parameter list informs TypeScript that:
   *
   * - The first parameter is expected to be a
   *   SetupNetworkResult, as defined in setupNetwork.ts
   *
   *   Out of this parameter, we only care about two fields:
   *   - worldContract (which comes from getContract, see
   *     https://github.com/latticexyz/mud/blob/main/templates/react/packages/client/src/mud/setupNetwork.ts#L63-L69).
   *
   *   - waitForTransaction (which comes from syncToRecs, see
   *     https://github.com/latticexyz/mud/blob/main/templates/react/packages/client/src/mud/setupNetwork.ts#L77-L83).
   *
   * - From the second parameter, which is a ClientComponent,
   *   we only care about Counter. This parameter comes to use
   *   through createClientComponents.ts, but it originates in
   *   syncToRecs
   *   (https://github.com/latticexyz/mud/blob/main/templates/react/packages/client/src/mud/setupNetwork.ts#L77-L83).
   */
  { tables, useStore, worldContract, waitForTransaction }: SetupNetworkResult,
) {
  const addTask = async (label: string) => {
    const tx = await worldContract.write.app__addTask([label]);
    await waitForTransaction(tx);
  };

  const toggleTask = async (id: Hex) => {
    const isComplete = (useStore.getState().getValue(tables.Tasks, { id })?.completedAt ?? 0n) > 0n;
    const tx = isComplete
      ? await worldContract.write.app__resetTask([id])
      : await worldContract.write.app__completeTask([id]);
    await waitForTransaction(tx);
  };

  const deleteTask = async (id: Hex) => {
    const tx = await worldContract.write.app__deleteTask([id]);
    await waitForTransaction(tx);
  };

  return {
    addTask,
    toggleTask,
    deleteTask,
  };
}
