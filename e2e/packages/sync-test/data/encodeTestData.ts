import { mapObject } from "@latticexyz/utils";
import { Data, EncodedData } from "./types";
import { encodeAbiParameters, toHex, encodePacked, numberToHex } from "viem";
import config from "../../contracts/mud.config";

/**
 * Turns the typed data into encoded data in the format expected by `world.setRecord`
 */
export function encodeTestData(testData: Data) {
  return mapObject(testData, (records, table) =>
    records
      ? records.map((record) => ({
          key: Object.entries(record.key).map(([keyName, keyValue]) => {
            const signed = config.tables[table].keySchema[keyName]?.startsWith("int");
            return encodeAbiParameters(
              [{ type: "bytes32" }],
              [signed ? numberToHex(keyValue as any, { size: 32, signed }) : toHex(keyValue as any, { size: 32 })]
            );
          }),
          value: encodePacked(Object.values(config.tables[table].schema), Object.values(record.value)),
        }))
      : undefined
  ) as EncodedData<typeof testData>;
}
