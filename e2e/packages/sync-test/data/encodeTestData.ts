import { mapObject } from "@latticexyz/utils";
import {
  encodeKey,
  encodeValueArgs,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
  valueSchemaToFieldLayoutHex,
} from "@latticexyz/protocol-parser/internal";
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
      const keySchema = getSchemaTypes(getKeySchema(tableConfig));
      const valueSchema = getSchemaTypes(getValueSchema(tableConfig));
      const key = encodeKey(keySchema, record.key);
      const valueArgs = encodeValueArgs(valueSchema, record.value);
      const fieldLayout = valueSchemaToFieldLayoutHex(valueSchema);

      return {
        key,
        ...valueArgs,
        fieldLayout,
      };
    });
  }) as EncodedData<typeof testData>;
}
