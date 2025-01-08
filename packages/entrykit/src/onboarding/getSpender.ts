import { Address, Chain, Client, Transport } from "viem";
import { paymasterTables } from "../quarry/common";
import { getRecord } from "@latticexyz/store/internal";
import { getPaymaster } from "../getPaymaster";

export type GetSpenderParams = {
  client: Client<Transport, Chain>;
  userAddress: Address;
  sessionAddress: Address;
};

export async function getSpender({ client, userAddress, sessionAddress }: GetSpenderParams) {
  const paymaster = getPaymaster(client.chain);
  if (paymaster?.type !== "quarry") return null;

  const record = await getRecord(client, {
    address: paymaster.address,
    table: paymasterTables.Spender,
    key: { spender: sessionAddress },
    blockTag: "pending",
  });
  return record.user.toLowerCase() === userAddress.toLowerCase();
}
