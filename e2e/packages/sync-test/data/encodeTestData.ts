import { mapObject } from "@latticexyz/utils";
import { abiTypesToSchema, encodeKey, encodeValue, schemaToHex } from "@latticexyz/protocol-parser";
import { Data, EncodedData } from "./types";
import config from "../../contracts/mud.config";

/**
 * Turns the typed data into encoded data in the format expected by `world.setRecord`
 */
export function encodeTestData(testData: Data) {
  return mapObject(testData, (records, table) => {
    if (!records) return undefined;
    const tableConfig = config.tables[table];
    return records.map((record) => {
      const encodedKey = encodeKey(tableConfig.keySchema, record.key);
      const encodedValue = encodeValue(tableConfig.schema, record.value);

      const encodedValueSchema = schemaToHex(abiTypesToSchema(Object.values(config.tables[table].schema)));

      return {
        key: encodedKey,
        value: encodedValue,
        valueSchema: encodedValueSchema,
      };
    });
  }) as EncodedData<typeof testData>;
}
