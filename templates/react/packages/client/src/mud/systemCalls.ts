import { parseEther, type Hex } from "viem";
import { resourceToHex } from "@latticexyz/common";
import { encodeSystemCallFrom } from "@latticexyz/world";
import { type ExternalWalletClient } from "../MUDContext";
import { type SetupNetworkResult } from "./setupNetwork";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

// TODO: Should use `std-delegations` to limit authority
const UNLIMITED_DELEGATION = resourceToHex({ type: "system", namespace: "", name: "unlimited" });

export const isDelegated = (delegationControlId: Hex) => delegationControlId === UNLIMITED_DELEGATION;

export const delegateToBurner = async (network: SetupNetworkResult, externalWalletClient: ExternalWalletClient) => {
  const { request } = await network.publicClient.simulateContract({
    account: externalWalletClient.account,
    address: network.worldContract.address,
    abi: IWorldAbi,
    functionName: "registerDelegation",
    args: [network.walletClient.account.address, UNLIMITED_DELEGATION, "0x0"],
  });

  const tx1 = await externalWalletClient.writeContract(request);
  await network.waitForTransaction(tx1);

  // for transaction fees
  const tx2 = await externalWalletClient.sendTransaction({
    to: network.walletClient.account.address,
    value: parseEther("0.001"),
  });
  await network.waitForTransaction(tx2);
};

/*
 * System calls executed by the burner wallet on behalf of the external wallet.
 * This is solely for demonstration purposes, showing delegation, since these calls do not depend on the sender.
 */

export const addTask = async (
  network: SetupNetworkResult,
  externalWalletClient: ExternalWalletClient,
  label: string,
) => {
  const tx = await network.worldContract.write.callFrom(
    encodeSystemCallFrom({
      from: externalWalletClient.account.address,
      abi: IWorldAbi,
      functionName: "addTask",
      args: [label],
      systemId: resourceToHex({ type: "system", namespace: "", name: "TasksSystem" }),
    }),
  );
  await network.waitForTransaction(tx);
};

export const toggleTask = async (network: SetupNetworkResult, externalWalletClient: ExternalWalletClient, key: Hex) => {
  const isComplete = (network.useStore.getState().getValue(network.tables.Tasks, { key })?.completedAt ?? 0n) > 0n;

  const call = encodeSystemCallFrom({
    from: externalWalletClient.account.address,
    abi: IWorldAbi,
    functionName: isComplete ? "resetTask" : "completeTask",
    args: [key],
    systemId: resourceToHex({ type: "system", namespace: "", name: "TasksSystem" }),
  });

  const tx = await network.worldContract.write.callFrom(call);
  await network.waitForTransaction(tx);
};

export const deleteTask = async (network: SetupNetworkResult, externalWalletClient: ExternalWalletClient, key: Hex) => {
  const tx = await network.worldContract.write.callFrom(
    encodeSystemCallFrom({
      from: externalWalletClient.account.address,
      abi: IWorldAbi,
      functionName: "deleteTask",
      args: [key],
      systemId: resourceToHex({ type: "system", namespace: "", name: "TasksSystem" }),
    }),
  );
  await network.waitForTransaction(tx);
};
