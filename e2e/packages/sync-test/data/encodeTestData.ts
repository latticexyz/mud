import { mapObject } from "@latticexyz/utils";
import { Data, EncodedData } from "./types";
import { encodeAbiParameters } from "viem";
import { Schema, encodeRecord } from "@latticexyz/protocol-parser";
import config from "../../contracts/mud.config";
import { DynamicAbiType, SchemaAbiType, StaticAbiType, isDynamicAbiType } from "@latticexyz/schema-type";

/**
 * Turns the typed data into encoded data in the format expected by `world.setRecord`
 */
export function encodeTestData(testData: Data) {
  return mapObject(testData, (records, table) =>
    records
      ? records.map((record) => {
          const valueSchema = abiTypesToSchema(Object.values(config.tables[table].schema));
          const value = encodeRecord(valueSchema, Object.values(record.value));
          const key = Object.entries(record.key).map(([keyName, keyValue]) => {
            return encodeAbiParameters([{ type: config.tables[table].keySchema[keyName] }], [keyValue]);
          });
          return {
            key,
            value,
          };
        })
      : undefined
  ) as EncodedData<typeof testData>;
}

function abiTypesToSchema(abiTypes: SchemaAbiType[]): Schema {
  const staticFields: StaticAbiType[] = [];
  const dynamicFields: DynamicAbiType[] = [];
  for (const abiType of abiTypes) {
    if (isDynamicAbiType(abiType)) dynamicFields.push(abiType);
    else staticFields.push(abiType);
  }
  return { staticFields, dynamicFields };
}
