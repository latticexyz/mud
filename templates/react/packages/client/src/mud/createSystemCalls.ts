/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */
import { Hex, WalletClient, Transport, Chain, Account } from "viem";
import { getComponentValue } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SetupNetworkResult } from "./setupNetwork";
import { ClientComponents } from "./createClientComponents";
import { UNLIMITED_DELEGATION } from "./constants";
import { createContract, ContractWrite } from "@latticexyz/common";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  /*
   * The parameter list informs TypeScript that:
   *
   * - The first parameter is expected to be a
   *   SetupNetworkResult, as defined in setupNetwork.ts
   *
   * - Out of this parameter, we only care about two fields:
   *   - worldContract (which comes from createContract, see
   *     https://github.com/latticexyz/mud/blob/26dabb34321eedff7a43f3fcb46da4f3f5ba3708/templates/react/packages/client/src/mud/setupNetwork.ts#L31).
   *   - waitForTransaction (which comes from syncToRecs, see
   *     https://github.com/latticexyz/mud/blob/26dabb34321eedff7a43f3fcb46da4f3f5ba3708/templates/react/packages/client/src/mud/setupNetwork.ts#L39).
   *
   * - From the second parameter, which is a ClientComponent,
   *   we only care about Counter. This parameter comes to use
   *   through createClientComponents.ts, but it originates in
   *   syncToRecs (https://github.com/latticexyz/mud/blob/26dabb34321eedff7a43f3fcb46da4f3f5ba3708/templates/react/packages/client/src/mud/setupNetwork.ts#L39).
   */
  { worldAddress, waitForTransaction, getResourceSelector, publicClient, write$ }: SetupNetworkResult,
  { Counter }: ClientComponents,
  walletClient: WalletClient<Transport, Chain, Account>
) {
  /*
   * Create an object for communicating with the deployed World.
   */
  const worldContract = createContract({
    address: worldAddress as Hex,
    abi: IWorldAbi,
    publicClient,
    walletClient,
    onWrite: (write) => write$.next(write),
    getResourceSelector,
  });

  const increment = async () => {
    /*
     * Because IncrementSystem
     * (https://mud.dev/tutorials/walkthrough/minimal-onchain#incrementsystemsol)
     * is in the root namespace, `.increment` can be called directly
     * on the World contract.
     */
    const tx = await worldContract.write.increment();
    await waitForTransaction(tx);
    return getComponentValue(Counter, singletonEntity);
  };

  const registerDelegation = async (delegatee: Hex) => {
    const callData = "0x";
    console.log({ delegatee, UNLIMITED_DELEGATION, callData });
    const tx = await worldContract.write.registerDelegation([delegatee, UNLIMITED_DELEGATION, callData], {
      gas: 15000000n,
    });
    await waitForTransaction(tx);
  };

  return {
    increment,
    registerDelegation,
  };
}
