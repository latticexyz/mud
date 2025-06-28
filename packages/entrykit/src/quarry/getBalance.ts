import { Address, Chain, Client, Transport } from "viem";
import { paymasterTables } from "./common";
import { getRecord } from "@latticexyz/store/internal";
import { getPaymaster } from "../getPaymaster";

export type GetBalanceParams = {
  client: Client<Transport, Chain>;
  userAddress: Address;
};

export async function getBalance({ client, userAddress }: GetBalanceParams) {
  const paymaster = getPaymaster(client.chain);
  if (paymaster?.type !== "quarry") return null;

  const record = await getRecord(client, {
    address: paymaster.address,
    table: paymasterTables.Balance,
    key: { user: userAddress },
    blockTag: "pending",
  });
  return record.balance;
}
