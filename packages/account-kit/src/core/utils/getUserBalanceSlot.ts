import { Address } from "viem";
import gasTankConfig from "../gas-tank/mud.config";
import { getStaticDataLocation } from "./getStaticDataLocation";
import { encodeKeyTuple } from "./encodeKeyTuple";
import { getKeySchema } from "@latticexyz/protocol-parser/internal";

// TODO: move this to gas-tank package or similar

export function getUserBalanceSlot(userAccount: Address) {
  return getStaticDataLocation(
    gasTankConfig.tables.UserBalances.tableId,
    encodeKeyTuple(getKeySchema(gasTankConfig.tables.UserBalances), { userAccount }),
  );
}
