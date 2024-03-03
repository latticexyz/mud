import { parseEther, type Hex, type WalletClient, type Transport, type Chain, type Account } from "viem";
import { resourceToHex } from "@latticexyz/common";
import { type Network } from "../setupNetwork";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

// Better to use `std-delegations` to limit authority
const UNLIMITED_DELEGATION = resourceToHex({ type: "system", namespace: "", name: "unlimited" });

export function isDelegated(delegationControlId: Hex) {
  return delegationControlId === UNLIMITED_DELEGATION;
}

export async function delegateToBurner(
  network: Network,
  externalWalletClient: WalletClient<Transport, Chain, Account>,
  burnerWalletClient: WalletClient<Transport, Chain, Account>,
) {
  const { request } = await network.publicClient.simulateContract({
    account: externalWalletClient.account,
    address: network.worldAddress,
    abi: IWorldAbi,
    functionName: "registerDelegation",
    args: [burnerWalletClient.account.address, UNLIMITED_DELEGATION, "0x0"],
  });

  const tx1 = await externalWalletClient.writeContract(request);
  await network.waitForTransaction(tx1);

  // for transaction fees
  const tx2 = await externalWalletClient.sendTransaction({
    to: burnerWalletClient.account.address,
    value: parseEther("0.001"),
  });
  await network.waitForTransaction(tx2);
}
