import { Address, Chain, Client, Transport } from "viem";
import { paymasterTables } from "../paymaster";
import { getRecord } from "@latticexyz/store/internal";

// TODO: dedupe this (exists in cli and entrykit)

export type GetAllowanceParams = {
  client: Client<Transport, Chain>;
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
