import { mapObject } from "@latticexyz/utils";
import { Data, EncodedData } from "./types";
import { encodeAbiParameters, toHex, encodePacked } from "viem";
import config from "../../contracts/mud.config";

/**
 * Turns the typed data into encoded data in the format expected by `world.setRecord`
 */
export function encodeTestData(testData: Data) {
  return mapObject(testData, (records, table) =>
    records
      ? records.map((record) => ({
          key: Object.values(record.key).map((key) => encodeAbiParameters([{ type: "bytes32" }], [toHex(key as any)])),
          value: encodePacked(Object.values(config.tables[table].schema), Object.values(record.value)),
        }))
      : undefined
  ) as EncodedData<typeof testData>;
}
