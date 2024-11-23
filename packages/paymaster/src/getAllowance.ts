import { Address, Client, numberToHex } from "viem";
import { paymasterTables } from "./paymaster";
import { getRecord, getStaticDataLocation } from "@latticexyz/store/internal";
import { getKeyTuple } from "@latticexyz/protocol-parser/internal";
import { setStorageAt } from "viem/actions";

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

export function getAllowanceSlot({ userAddress }: { userAddress: Address }) {
  return getStaticDataLocation(
    paymasterTables.Allowance.tableId,
    getKeyTuple(paymasterTables.Allowance, { user: userAddress }),
  );
}

// TODO: move this into some sort of store util to `setField`
export async function setAllowanceSlot({
  client,
  paymasterAddress,
  userAddress,
  allowance,
}: GetAllowanceParams & { allowance: bigint }) {
  const slot = getStaticDataLocation(
    paymasterTables.Allowance.tableId,
    getKeyTuple(paymasterTables.Allowance, { user: userAddress }),
  );

  await setStorageAt(
    client.extend(() => ({ mode: "anvil" })),
    {
      address: paymasterAddress,
      index: slot,
      value: numberToHex(allowance, { size: 32 }),
    },
  );
}
