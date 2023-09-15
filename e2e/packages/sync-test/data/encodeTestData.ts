import { mapObject } from "@latticexyz/utils";
import { Data, EncodedData } from "./types";
import { encodeAbiParameters, encodePacked } from "viem";
import config from "../../contracts/mud.config";
import { abiTypesToSchema, schemaToHex } from "@latticexyz/protocol-parser";
import { StaticAbiType } from "@latticexyz/schema-type";

/**
 * Turns the typed data into encoded data in the format expected by `world.setRecord`
 */
export function encodeTestData(testData: Data) {
  return mapObject(testData, (records, table) => {
    if (!records) return undefined;
    const keyConfig = config.tables[table].keySchema;
    return records.map((record) => {
      const encodedKey = Object.entries(record.key).map(([keyName, keyValue]) => {
        const keyType = keyConfig[keyName as keyof typeof keyConfig] as StaticAbiType;
        return encodeAbiParameters([{ type: keyType }], [keyValue]);
      });

      const encodedValue = encodePacked(Object.values(config.tables[table].valueSchema), Object.values(record.value));

      const encodedValueSchema = schemaToHex(abiTypesToSchema(Object.values(config.tables[table].valueSchema)));

      return {
        key: encodedKey,
        value: encodedValue,
        valueSchema: encodedValueSchema,
      };
    });
  }) as EncodedData<typeof testData>;
}
