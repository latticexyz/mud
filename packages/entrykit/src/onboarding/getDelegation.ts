import { Address, Chain, Client, Transport } from "viem";
import { getRecord } from "@latticexyz/store/internal";
import { unlimitedDelegationControlId, worldTables } from "../common";

export type GetDelegationParams = {
  client: Client<Transport, Chain>;
  worldAddress: Address;
  userAddress: Address;
  sessionAddress: Address;
};

export async function getDelegation({ client, worldAddress, userAddress, sessionAddress }: GetDelegationParams) {
  const record = await getRecord(client, {
    address: worldAddress,
    table: worldTables.UserDelegationControl,
    key: { delegator: userAddress, delegatee: sessionAddress },
    blockTag: "pending",
  });
  return record.delegationControlId === unlimitedDelegationControlId;
}
