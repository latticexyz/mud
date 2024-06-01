import { Account, Chain, Client, Hex, Transport } from "viem";
import { writeContract } from "viem/actions";
import { SetupNetworkResult } from "./setupNetwork";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls({ tables, useStore, waitForTransaction, worldAddress }: SetupNetworkResult) {
  const addTask = async (client: Client<Transport, Chain, Account> | undefined, label: string) => {
    if (!client) throw new Error("Not connected");

    const tx = await writeContract(client, {
      address: worldAddress,
      abi: IWorldAbi,
      functionName: "app__addTask",
      args: [label],
    });
    await waitForTransaction(tx);
  };

  const toggleTask = async (client: Client<Transport, Chain, Account> | undefined, id: Hex) => {
    if (!client) throw new Error("Not connected");

    const isComplete = (useStore.getState().getValue(tables.Tasks, { id })?.completedAt ?? 0n) > 0n;
    const tx = isComplete
      ? await writeContract(client, {
          address: worldAddress,
          abi: IWorldAbi,
          functionName: "app__resetTask",
          args: [id],
        })
      : await writeContract(client, {
          address: worldAddress,
          abi: IWorldAbi,
          functionName: "app__completeTask",
          args: [id],
        });
    await waitForTransaction(tx);
  };

  const deleteTask = async (client: Client<Transport, Chain, Account> | undefined, id: Hex) => {
    if (!client) throw new Error("Not connected");

    const tx = await writeContract(client, {
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
