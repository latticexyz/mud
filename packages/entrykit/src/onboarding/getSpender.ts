import { Address, Chain, Client, Transport } from "viem";
import { paymasterTables } from "../paymaster";
import { getRecord } from "../utils/getRecord";

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
  });
  return record.user.toLowerCase() === userAddress.toLowerCase();
}
