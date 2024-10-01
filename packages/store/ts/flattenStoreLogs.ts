import { Log, size } from "viem";
import { storeEventsAbi } from "./storeEventsAbi";
import { emptyRecord } from "./common";
import { StoreLog, StoreSetRecordLog } from "./storeLog";
import { spliceHex } from "@latticexyz/common";

function getKey(log: Log<bigint, number, boolean, undefined, true, storeEventsAbi, undefined>) {
  return [log.address, log.args.tableId, log.args.keyTuple.join(",")].join(":");
}

export function flattenStoreLogs(logs: StoreLog[]): StoreSetRecordLog[] {
  const records = new Map<string, StoreSetRecordLog>();

  for (const log of logs) {
    const key = getKey(log);

    if (log.eventName === "Store_SetRecord") {
      // maps preserve order, so always delete then set so the record gets
      // added to the end of the map, thus preserving the log order
      records.delete(key);
      records.set(key, log);
    } else if (log.eventName === "Store_SpliceStaticData") {
      const previousRecord = records.get(key);
      const { staticData, encodedLengths, dynamicData } = previousRecord?.args ?? emptyRecord;
      const nextRecord = {
        ...log,
        eventName: "Store_SetRecord",
        args: {
          tableId: log.args.tableId,
          keyTuple: log.args.keyTuple,
          staticData: spliceHex(staticData, log.args.start, size(log.args.data), log.args.data),
          encodedLengths,
          dynamicData,
        },
      } satisfies StoreSetRecordLog;
      // maps preserve order, so always delete then set so the record gets
      // added to the end of the map, thus preserving the log order
      records.delete(key);
      records.set(key, nextRecord);
    } else if (log.eventName === "Store_SpliceDynamicData") {
      const previousRecord = records.get(key);
      const { staticData, dynamicData } = previousRecord?.args ?? emptyRecord;
      const nextRecord = {
        ...log,
        eventName: "Store_SetRecord",
        args: {
          tableId: log.args.tableId,
          keyTuple: log.args.keyTuple,
          staticData,
          encodedLengths: log.args.encodedLengths,
          dynamicData: spliceHex(dynamicData, log.args.start, log.args.deleteCount, log.args.data),
        },
      } satisfies StoreSetRecordLog;
      // maps preserve order, so always delete then set so the record gets
      // added to the end of the map, thus preserving the log order
      records.delete(key);
      records.set(key, nextRecord);
    } else if (log.eventName === "Store_DeleteRecord") {
      records.delete(key);
    }
  }

  return Array.from(records.values());
}
