import { Address, Chain, Client, Transport } from "viem";
import { getRecord } from "./utils/getRecord";
import modulesConfig from "@latticexyz/world-modules/internal/mud.config";

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
    table: modulesConfig.tables.CallWithSignatureNonces,
    key: { signer: userAddress },
    blockTag: "pending",
  });
  return record.nonce;
}
