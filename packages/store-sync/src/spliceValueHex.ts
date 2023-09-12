import { UNCHANGED_PACKED_COUNTER, readHex } from "@latticexyz/protocol-parser";
import { Hex, size, concatHex } from "viem";
import { StorageAdapterLog } from "./common";

export function spliceValueHex(
  previousData: Hex,
  log: StorageAdapterLog & ({ eventName: "StoreSpliceStaticRecord" } | { eventName: "StoreSpliceDynamicRecord" })
): Hex {
  let newData = previousData;

  if (log.args.newDynamicLengths !== UNCHANGED_PACKED_COUNTER) {
    const start = Number(log.args.dynamicLengthsStart);
    const end = start + size(log.args.newDynamicLengths);
    newData = concatHex([readHex(newData, 0, start), log.args.newDynamicLengths, readHex(newData, end)]);
  }

  const start = log.args.start;
  const end = start + log.args.deleteCount;
  newData = concatHex([readHex(newData, 0, start), log.args.data, readHex(newData, end)]);

  return newData;
}
