import { type Hex } from "viem";
import { type Network } from "./setupNetwork";
import { type Burner } from "./wallet/createBurner";

export async function addTask(network: Network, worldContract: Burner["worldContract"], label: string) {
  const tx = await worldContract.write.addTask([label]);
  await network.waitForTransaction(tx);
}

export async function toggleTask(network: Network, worldContract: Burner["worldContract"], key: Hex) {
  const isComplete = (network.useStore.getState().getValue(network.tables.Tasks, { key })?.completedAt ?? 0n) > 0n;

  const tx = isComplete ? await worldContract.write.resetTask([key]) : await worldContract.write.completeTask([key]);
  await network.waitForTransaction(tx);
}

export async function deleteTask(network: Network, worldContract: Burner["worldContract"], key: Hex) {
  const tx = await worldContract.write.deleteTask([key]);
  await network.waitForTransaction(tx);
}
