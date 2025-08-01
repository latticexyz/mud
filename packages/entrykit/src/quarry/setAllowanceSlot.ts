import { Address, Chain, Client, Transport, numberToHex, zeroAddress } from "viem";
import { paymasterTables } from "./common";
import { getStaticDataLocation } from "@latticexyz/store/internal";
import { getKeyTuple } from "@latticexyz/protocol-parser/internal";
import { setStorageAt } from "viem/actions";
import { getPaymaster } from "../getPaymaster";

// TODO: move this into some sort of store util to `setField`

/** @internal */
export async function setAllowanceSlot({
  client,
  userAddress,
  allowance,
}: {
  client: Client<Transport, Chain>;
  userAddress: Address;
  allowance: bigint;
}) {
  const paymaster = getPaymaster(client.chain);
  if (paymaster?.type !== "quarry") return;

  const slot = getStaticDataLocation(
    paymasterTables.Allowance.tableId,
    getKeyTuple(paymasterTables.Allowance, { user: userAddress, sponsor: zeroAddress }),
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
