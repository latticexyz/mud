import { parseEther, type Hex, type WalletClient, type Transport, type Chain, type Account } from "viem";
import { resourceToHex } from "@latticexyz/common";
import { type Network } from "../setupNetwork";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

// Consider using `std-delegations` to limit authority.
const UNLIMITED_DELEGATION = resourceToHex({ type: "system", namespace: "", name: "unlimited" });

// Set up delegation: an external wallet delegates authority to a delegatee.
// Also send some balance to the delegatee for transaction fees on non transaction-free chains.
export async function setupDelegation(
  network: Network,
  externalWalletClient: WalletClient<Transport, Chain, Account>,
  delegateeAddress: Hex,
) {
  const { request } = await network.publicClient.simulateContract({
    account: externalWalletClient.account,
    address: network.worldAddress,
    abi: IWorldAbi,
    functionName: "registerDelegation",
    args: [delegateeAddress, UNLIMITED_DELEGATION, "0x0"],
  });

  const delegationTx = await externalWalletClient.writeContract(request);
  await network.waitForTransaction(delegationTx);

  // for transaction fees
  const transferTx = await externalWalletClient.sendTransaction({
    to: delegateeAddress,
    value: parseEther("0.001"),
  });
  await network.waitForTransaction(transferTx);
}

export function isDelegated(delegation: { delegationControlId: Hex } | undefined) {
  return delegation?.delegationControlId === UNLIMITED_DELEGATION;
}
