import { Address, Chain, Client, Transport } from "viem";
import { getRecord } from "@latticexyz/store/internal";
import moduleConfig from "@latticexyz/world-module-callwithsignature/mud.config";

export type GetCallWithSignatureNonceParams = {
  client: Client<Transport, Chain>;
  worldAddress: Address;
  userAddress: Address;
};

export async function getCallWithSignatureNonce({
  client,
  worldAddress,
  userAddress,
}: GetCallWithSignatureNonceParams) {
  const record = await getRecord(client, {
    address: worldAddress,
    table: moduleConfig.tables.CallWithSignatureNonces,
    key: { signer: userAddress },
    blockTag: "pending",
  });
  return record.nonce;
}
