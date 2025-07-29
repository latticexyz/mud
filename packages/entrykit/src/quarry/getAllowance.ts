import { Address, Chain, Client, Transport, numberToHex } from "viem";
import { paymasterTables } from "./common";
import { getRecord, getStaticDataLocation } from "@latticexyz/store/internal";
import { getKeyTuple } from "@latticexyz/protocol-parser/internal";
import { setStorageAt } from "viem/actions";
import { getPaymaster } from "../getPaymaster";

export type GetAllowanceParams = {
  client: Client<Transport, Chain>;
  userAddress: Address;
};

export async function getAllowance({ client, userAddress }: GetAllowanceParams) {
  const paymaster = getPaymaster(client.chain, undefined);
  if (paymaster?.type !== "quarry") return null;

  const record = await getRecord(client, {
    address: paymaster.address,
    table: paymasterTables.Allowance,
    key: { user: userAddress },
    blockTag: "pending",
  });
  return record.allowance;
}

export function getAllowanceSlot({ userAddress }: { userAddress: Address }) {
  return getStaticDataLocation(
    paymasterTables.Allowance.tableId,
    getKeyTuple(paymasterTables.Allowance, { user: userAddress }),
  );
}

// TODO: move this into some sort of store util to `setField`
export async function setAllowanceSlot({ client, userAddress, allowance }: GetAllowanceParams & { allowance: bigint }) {
  const paymaster = getPaymaster(client.chain, undefined);
  if (paymaster?.type !== "quarry") return;

  const slot = getStaticDataLocation(
    paymasterTables.Allowance.tableId,
    getKeyTuple(paymasterTables.Allowance, { user: userAddress }),
  );

  await setStorageAt(
    client.extend(() => ({ mode: "anvil" })),
    {
      address: paymaster.address,
      index: slot,
      value: numberToHex(allowance, { size: 32 }),
    },
  );
}
