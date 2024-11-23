import { Address, Chain, Client, Hex, OneOf, Transport, toHex } from "viem";
import { signTypedData } from "viem/actions";
import { callWithSignatureTypes } from "@latticexyz/world/internal";
import { getRecord } from "@latticexyz/store/internal";
import modulesConfig from "@latticexyz/world-modules/internal/mud.config";
import { hexToResource } from "@latticexyz/common";
import { getAction } from "viem/utils";
import { ConnectedClient } from "../common";

// TODO: move this to world package or similar

export type SignCallOptions<chain extends Chain = Chain> = {
  userClient: ConnectedClient<chain>;
  worldAddress: Address;
  systemId: Hex;
  callData: Hex;
} & OneOf<{ nonce: bigint } | { client: Client<Transport, chain> }>;

export async function signCall<chain extends Chain = Chain>({
  userClient,
  worldAddress,
  systemId,
  callData,
  nonce: initialNonce,
  client,
}: SignCallOptions<chain>) {
  const nonce =
    initialNonce ??
    (client
      ? (
          await getRecord(client, {
            address: worldAddress,
            table: modulesConfig.tables.CallWithSignatureNonces,
            key: { signer: userClient.account.address },
            blockTag: "pending",
          })
        ).nonce
      : 0n);

  const { namespace: systemNamespace, name: systemName } = hexToResource(systemId);

  return await getAction(
    userClient,
    signTypedData,
    "signTypedData",
  )({
    account: userClient.account,
    domain: {
      verifyingContract: worldAddress,
      salt: toHex(userClient.chain.id, { size: 32 }),
    },
    types: callWithSignatureTypes,
    primaryType: "Call",
    message: {
      signer: userClient.account.address,
      systemNamespace,
      systemName,
      callData,
      nonce,
    },
  });
}
