import { mapObject } from "@latticexyz/utils";
import { Data, Datum } from "./types";
import { serialize } from "./utils";

/**
 * Merges an array of test data by merging and filtering the records for each table,
 * retaining only the last occurrence of each unique key.
 */
export function mergeTestData(...testDatas: Data[]) {
  const recordsByTableByKeys: { [table: string]: { [key: string]: Datum } } = {};

  for (const testData of testDatas) {
    for (const [table, records] of Object.entries(testData)) {
      recordsByTableByKeys[table] ??= {};
      for (const record of records) {
        recordsByTableByKeys[table][serialize(record.key)] = record;
      }
    }
  }

  const mergedData = mapObject(recordsByTableByKeys, (recordsByKeys) => Object.values(recordsByKeys));
  return mergedData;
}
