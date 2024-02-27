import { parseEther, type Hex } from "viem";
import { resourceToHex } from "@latticexyz/common";
import { encodeSystemCallFrom } from "@latticexyz/world";
import { type ExternalWalletClient } from "./NetworkContext";
import { type PublicClient, type BurnerClient } from "./setupNetwork";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

// Executes the `increment` system call on behalf of the external wallet using the burner wallet.
// This is solely for demonstrating burner wallet delegation, as the `increment` call can actually be made by any sender.
export const increment = async (
  worldAddress: Hex,
  publicClient: PublicClient,
  externalWalletClient: ExternalWalletClient,
  burnerClient: BurnerClient
) => {
  const { request } = await burnerClient.simulateContract({
    account: burnerClient.account,
    address: worldAddress,
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

  const tx = await burnerClient.writeContract(request);

  await publicClient.waitForStoreSync(tx);
};

// TODO: Should use `std-delegations` to limit authority
const UNLIMITED_DELEGATION = resourceToHex({ type: "system", namespace: "", name: "unlimited" });

export const isDelegated = (delegationControlId: Hex) => delegationControlId === UNLIMITED_DELEGATION;

export const delegateToBurner = async (
  worldAddress: Hex,
  publicClient: PublicClient,
  externalWalletClient: ExternalWalletClient,
  burnerClient: BurnerClient
) => {
  const { request } = await publicClient.simulateContract({
    account: externalWalletClient.account,
    address: worldAddress,
    abi: IWorldAbi,
    functionName: "registerDelegation",
    args: [burnerClient.account.address, UNLIMITED_DELEGATION, "0x0"],
  });

  const tx1 = await externalWalletClient.writeContract(request);
  await publicClient.waitForStoreSync(tx1);

  // for transaction fees
  const tx2 = await externalWalletClient.sendTransaction({
    to: burnerClient.account.address,
    value: parseEther("0.001"),
  });
  await publicClient.waitForStoreSync(tx2);
};
