import { Address } from "abitype";
import { Hex, WalletClient, Transport, Chain, Account, PublicClient } from "viem";
import { writeContract } from "viem/actions";
import { AppAccountClient } from "./common";
import { getRecord } from "./getRecord";
import { signCall } from "./signCall";
import modulesConfig from "@latticexyz/world-modules/internal/mud.config";
import CallWithSignatureAbi from "@latticexyz/world-modules/out/IUnstable_CallWithSignatureSystem.sol/IUnstable_CallWithSignatureSystem.abi.json";

// TODO: adjust type to be publicClient OR nonce
// TODO: redo generics, they don't allow for good type hinting

export type CallWithSignatureOptions = {
  chainId: number;
  worldAddress: Address;
  systemId: Hex;
  callData: Hex;
  publicClient: PublicClient;
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

  const signature = await signCall(chainId, worldAddress, userAccountClient, systemId, callData, nonce);

  return writeContract(appAccountClient, {
    address: worldAddress,
    abi: CallWithSignatureAbi,
    functionName: "callWithSignature",
    args: [userAccountClient.account.address, systemId, callData, signature],
  });
}
