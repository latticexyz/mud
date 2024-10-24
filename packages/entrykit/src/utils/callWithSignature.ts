import { Address } from "abitype";
import { Hex, Client } from "viem";
import { writeContract as viem_writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import { signCall } from "./signCall";
import CallWithSignatureAbi from "@latticexyz/world-modules/out/IUnstable_CallWithSignatureSystem.sol/IUnstable_CallWithSignatureSystem.abi.json";
import { ConnectedClient } from "../common";

// TODO: move this to world package or similar
// TODO: nonce _or_ publicClient?

export type CallWithSignatureOptions = {
  chainId: number;
  worldAddress: Address;
  systemId: Hex;
  callData: Hex;
  /**
   * This should be bound to the same chain as `chainId` option.
   */
  publicClient: Client;
  userAccountClient: ConnectedClient;
  appAccountClient: ConnectedClient;
  nonce?: bigint | null;
};

export async function callWithSignature({
  chainId,
  worldAddress,
  systemId,
  callData,
  publicClient,
  userAccountClient,
  appAccountClient,
  nonce,
}: CallWithSignatureOptions) {
  const signature = await signCall({
    userAccountClient,
    chainId,
    worldAddress,
    systemId,
    callData,
    nonce,
    publicClient,
  });

  return getAction(
    appAccountClient,
    viem_writeContract,
    "writeContract",
  )({
    address: worldAddress,
    abi: CallWithSignatureAbi,
    functionName: "callWithSignature",
    args: [userAccountClient.account.address, systemId, callData, signature],
  } as never);
}
