import { Address, Client } from "viem";
import { getRecord } from "@latticexyz/store/internal";
import { unlimitedDelegationControlId, worldTables } from "../common";

export type GetDelegationParams = {
  client: Client;
  worldAddress: Address;
  userAddress: Address;
  sessionAddress: Address;
  blockTag?: "pending" | "latest";
};

// TODO: rename to `hasDelegation`?
export async function getDelegation({
  client,
  worldAddress,
  userAddress,
  sessionAddress,
  // TODO: move everything to latest instead of pending
  blockTag = "pending",
}: GetDelegationParams) {
  const record = await getRecord(client, {
    address: worldAddress,
    table: worldTables.UserDelegationControl,
    key: { delegator: userAddress, delegatee: sessionAddress },
    blockTag,
  });
  return record.delegationControlId === unlimitedDelegationControlId;
}
