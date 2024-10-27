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
  userClient: ConnectedClient;
  sessionClient: ConnectedClient;
  nonce?: bigint | null;
};

export async function callWithSignature({
  chainId,
  worldAddress,
  systemId,
  callData,
  publicClient,
  userClient,
  sessionClient,
  nonce,
}: CallWithSignatureOptions) {
  const signature = await signCall({
    userClient,
    chainId,
    worldAddress,
    systemId,
    callData,
    nonce,
    publicClient,
  });

  return getAction(
    sessionClient,
    viem_writeContract,
    "writeContract",
  )({
    address: worldAddress,
    abi: CallWithSignatureAbi,
    functionName: "callWithSignature",
    args: [userClient.account.address, systemId, callData, signature],
  } as never);
}
