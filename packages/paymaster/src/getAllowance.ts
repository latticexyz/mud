import { Address, Client } from "viem";
import { paymasterTables } from "./paymaster";
import { getRecord } from "@latticexyz/store/internal";

export type GetAllowanceParams = {
  client: Client;
  paymasterAddress: Address;
  userAddress: Address;
};

export async function getAllowance({ client, paymasterAddress, userAddress }: GetAllowanceParams) {
  const record = await getRecord(client, {
    address: paymasterAddress,
    table: paymasterTables.Allowance,
    key: { user: userAddress },
    blockTag: "pending",
  });
  return record.allowance;
}
