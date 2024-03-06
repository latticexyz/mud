import type { Hex, WalletClient, Transport, Chain, Account } from "viem";
import { type Network } from "./setupNetwork";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

export async function addTask(network: Network, walletClient: WalletClient<Transport, Chain, Account>, label: string) {
  const tx = await walletClient.writeContract({
    address: network.worldAddress,
    abi: IWorldAbi,
    functionName: "addTask",
    args: [label],
  });
  await network.waitForTransaction(tx);
}

export async function toggleTask(network: Network, walletClient: WalletClient<Transport, Chain, Account>, key: Hex) {
  const isComplete = (network.useStore.getState().getValue(network.tables.Tasks, { key })?.completedAt ?? 0n) > 0n;

  const tx = await walletClient.writeContract({
    address: network.worldAddress,
    abi: IWorldAbi,
    functionName: isComplete ? "resetTask" : "completeTask",
    args: [key],
  });
  await network.waitForTransaction(tx);
}

export async function deleteTask(network: Network, walletClient: WalletClient<Transport, Chain, Account>, key: Hex) {
  const tx = await walletClient.writeContract({
    address: network.worldAddress,
    abi: IWorldAbi,
    functionName: "deleteTask",
    args: [key],
  });
  await network.waitForTransaction(tx);
}
