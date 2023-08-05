import { mapObject } from "@latticexyz/utils";
import { Data, EncodedData } from "./types";
import { abiTypesToSchema, encodeRecord, encodeKeyTuple } from "@latticexyz/protocol-parser";
import config from "../../contracts/mud.config";

/**
 * Turns the typed data into encoded data in the format expected by `world.setRecord`
 */
export function encodeTestData(testData: Data) {
  return mapObject(testData, (records, table) =>
    records
      ? records.map((record) => {
          const valueSchema = abiTypesToSchema(Object.values(config.tables[table].schema));
          const keySchema = abiTypesToSchema(Object.values(config.tables[table].keySchema));
          const value = encodeRecord(valueSchema, Object.values(record.value));
          const key = encodeKeyTuple(keySchema, Object.values(record.key));
          return {
            key,
            value,
          };
        })
      : undefined
  ) as EncodedData<typeof testData>;
}
