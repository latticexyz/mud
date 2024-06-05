import { Hex } from "viem";
import { SetupNetworkResult } from "./setupNetwork";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { AppAccountClient } from "@latticexyz/account-kit";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls({ tables, useStore, waitForTransaction, worldAddress }: SetupNetworkResult) {
  const addTask = async (client: AppAccountClient, label: string) => {
    const tx = await client.writeContract({
      address: worldAddress,
      abi: IWorldAbi,
      functionName: "app__addTask",
      args: [label],
    });
    await waitForTransaction(tx);
  };

  const toggleTask = async (client: AppAccountClient, id: Hex) => {
    const isComplete = (useStore.getState().getValue(tables.Tasks, { id })?.completedAt ?? 0n) > 0n;
    const tx = isComplete
      ? await client.writeContract({
          address: worldAddress,
          abi: IWorldAbi,
          functionName: "app__resetTask",
          args: [id],
        })
      : await client.writeContract({
          address: worldAddress,
          abi: IWorldAbi,
          functionName: "app__completeTask",
          args: [id],
        });
    await waitForTransaction(tx);
  };

  const deleteTask = async (client: AppAccountClient, id: Hex) => {
    const tx = await client.writeContract({
      address: worldAddress,
      abi: IWorldAbi,
      functionName: "app__deleteTask",
      args: [id],
    });
    await waitForTransaction(tx);
  };

  return {
    addTask,
    toggleTask,
    deleteTask,
  };
}
