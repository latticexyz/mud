import { Address } from "abitype";
import { Hex, WalletClient, Transport, Chain, Account, PublicClient } from "viem";
import { writeContract } from "viem/actions";
import { AppAccountClient } from "../common";
import { getRecord } from "./getRecord";
import { signCall } from "./signCall";
import modulesConfig from "@latticexyz/world-modules/internal/mud.config";
import CallWithSignatureAbi from "@latticexyz/world-modules/out/IUnstable_CallWithSignatureSystem.sol/IUnstable_CallWithSignatureSystem.abi.json";

// TODO: move this to world package or similar

export type CallWithSignatureOptions = {
  chainId: number;
  worldAddress: Address;
  systemId: Hex;
  callData: Hex;
  /**
   * This should be bound to the same chain as `chainId` option.
   */
  publicClient: PublicClient<Transport, Chain>;
  userAccountClient: WalletClient<Transport, Chain, Account>;
  appAccountClient: AppAccountClient;
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
  nonce: initialNonce,
}: CallWithSignatureOptions) {
  // TODO: use nonce manager? need to be able to pass in method to "get current nonce" and also "should reset nonce" (unclear what errors are thrown for bad nonces here)
  const nonce =
    initialNonce ??
    (
      await getRecord(publicClient, {
        storeAddress: worldAddress,
        table: modulesConfig.tables.CallWithSignatureNonces,
        key: { signer: userAccountClient.account.address },
        blockTag: "pending",
      })
    ).nonce;

  const signature = await signCall({ userAccountClient, chainId, worldAddress, systemId, callData, nonce });

  return writeContract(appAccountClient, {
    address: worldAddress,
    abi: CallWithSignatureAbi,
    functionName: "callWithSignature",
    args: [userAccountClient.account.address, systemId, callData, signature],
  });
}
