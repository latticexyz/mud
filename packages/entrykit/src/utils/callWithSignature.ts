import { Chain } from "viem";
import { writeContract as viem_writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import { SignCallOptions, signCall } from "./signCall";
import CallWithSignatureAbi from "@latticexyz/world-modules/out/Unstable_CallWithSignatureSystem.sol/Unstable_CallWithSignatureSystem.abi.json";
import { ConnectedClient } from "../common";

// TODO: move this to world package or similar

export type CallWithSignatureOptions<chain extends Chain = Chain> = SignCallOptions<chain> & {
  sessionClient: ConnectedClient;
};

export async function callWithSignature<chain extends Chain = Chain>({
  sessionClient,
  ...opts
}: CallWithSignatureOptions<chain>) {
  const signature = await signCall(opts);
  return getAction(
    sessionClient,
    viem_writeContract,
    "writeContract",
  )({
    address: opts.worldAddress,
    abi: CallWithSignatureAbi,
    functionName: "callWithSignature",
    args: [opts.userClient.account.address, opts.systemId, opts.callData, signature],
  } as never);
}
