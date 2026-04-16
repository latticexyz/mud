import { Chain, parseErc6492Signature } from "viem";
import { writeContract as viem_writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import { SignCallOptions, signCall } from "./signCall";
import CallWithSignatureAbi from "@latticexyz/world-module-callwithsignature/out/CallWithSignatureSystem.sol/CallWithSignatureSystem.abi.json";
import { ConnectedClient } from "../common";

// TODO: move this to world package or similar

export type CallWithSignatureOptions<chain extends Chain = Chain> = SignCallOptions<chain> & {
  sessionClient: ConnectedClient;
};

export async function callWithSignature<chain extends Chain = Chain>({
  sessionClient,
  ...opts
}: CallWithSignatureOptions<chain>) {
  const rawSignature = await signCall(opts);

  // TODO: add support for ERC-6492 inside CallWithSignature module
  const { address, signature } = parseErc6492Signature(rawSignature);
  if (address != null) {
    throw new Error(
      "ERC-6492 signatures, like from Coinbase Smart Wallet, are not yet supported. Try using a different wallet?",
    );
  }

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
