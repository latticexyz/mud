import { Address, Chain, Client, Transport } from "viem";
import { paymasterTables } from "../paymaster/common";
import { getRecord } from "@latticexyz/store/internal";

export type GetSpenderParams = {
  client: Client<Transport, Chain>;
  paymasterAddress: Address;
  userAddress: Address;
  sessionAddress: Address;
};

export async function getSpender({ client, paymasterAddress, userAddress, sessionAddress }: GetSpenderParams) {
  const record = await getRecord(client, {
    address: paymasterAddress,
    table: paymasterTables.Spender,
    key: { spender: sessionAddress },
    blockTag: "pending",
  });
  return record.user.toLowerCase() === userAddress.toLowerCase();
}
