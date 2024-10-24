import { Address, Client, Hex, toHex } from "viem";
import { signTypedData } from "viem/actions";
import { callWithSignatureTypes } from "@latticexyz/world/internal";
import { getRecord } from "./getRecord";
import modulesConfig from "@latticexyz/world-modules/internal/mud.config";
import { hexToResource } from "@latticexyz/common";
import { getAction } from "viem/utils";
import { ConnectedClient } from "../common";

// TODO: move this to world package or similar
// TODO: nonce _or_ publicClient?

export type SignCallOptions = {
  userAccountClient: ConnectedClient;
  chainId: number;
  worldAddress: Address;
  systemId: Hex;
  callData: Hex;
  nonce?: bigint | null;
  /**
   * This should be bound to the same chain as `chainId` option.
   */
  publicClient?: Client;
};

export async function signCall({
  userAccountClient,
  chainId,
  worldAddress,
  systemId,
  callData,
  nonce: initialNonce,
  publicClient,
}: SignCallOptions) {
  const nonce =
    initialNonce ??
    (publicClient
      ? (
          await getRecord(publicClient, {
            address: worldAddress,
            table: modulesConfig.tables.CallWithSignatureNonces,
            key: { signer: userAccountClient.account.address },
            blockTag: "pending",
          })
        ).nonce
      : 0n);

  const { namespace: systemNamespace, name: systemName } = hexToResource(systemId);

  return await getAction(
    userAccountClient,
    signTypedData,
    "signTypedData",
  )({
    account: userAccountClient.account,
    domain: {
      verifyingContract: worldAddress,
      salt: toHex(chainId, { size: 32 }),
    },
    types: callWithSignatureTypes,
    primaryType: "Call",
    message: {
      signer: userAccountClient.account.address,
      systemNamespace,
      systemName,
      callData,
      nonce,
    },
  });
}
