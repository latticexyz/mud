import { parseEther, type Hex } from "viem";
import { resourceToHex } from "@latticexyz/common";
import { encodeSystemCallFrom } from "@latticexyz/world";
import { type MUDNetwork, type ExternalWalletClient } from "./NetworkContext";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

// Executes the `increment` system call on behalf of the external wallet using the burner wallet.
// This is solely for demonstrating burner wallet delegation, as the `increment` call can actually be made by any sender.
export const increment = async (externalWalletClient: ExternalWalletClient, network: MUDNetwork) => {
  const { request } = await network.burnerClient.simulateContract({
    account: network.burnerClient.account,
    address: network.worldAddress,
    abi: IWorldAbi,
    functionName: "callFrom",
    args: encodeSystemCallFrom({
      from: externalWalletClient.account.address,
      abi: IWorldAbi,
      functionName: "increment",
      args: [],
      systemId: resourceToHex({ type: "system", namespace: "", name: "increment" }),
    }),
  });

  const tx = await network.burnerClient.writeContract(request);

  network.waitForTransaction(tx);
};

// TODO: Should use `std-delegations` to limit authority
const UNLIMITED_DELEGATION = resourceToHex({ type: "system", namespace: "", name: "unlimited" });

export const isDelegated = (delegationControlId: Hex) => delegationControlId === UNLIMITED_DELEGATION;

export const delegateToBurner = async (externalWalletClient: ExternalWalletClient, network: MUDNetwork) => {
  const { request } = await network.publicClient.simulateContract({
    account: externalWalletClient.account,
    address: network.worldAddress,
    abi: IWorldAbi,
    functionName: "registerDelegation",
    args: [network.burnerClient.account.address, UNLIMITED_DELEGATION, "0x0"],
  });

  const tx1 = await externalWalletClient.writeContract(request);
  await network.waitForTransaction(tx1);

  // for transaction fees
  const tx2 = await externalWalletClient.sendTransaction({
    to: network.burnerClient.account.address,
    value: parseEther("0.001"),
  });
  network.waitForTransaction(tx2);
};
