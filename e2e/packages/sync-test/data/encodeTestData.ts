import { mapObject } from "@latticexyz/utils";
import { encodeKey, encodeValueArgs, valueSchemaToFieldLayoutHex } from "@latticexyz/protocol-parser/internal";
import { Data, EncodedData } from "./types";
import configV2 from "../../contracts/mud.config";
import { worldToV1 } from "@latticexyz/world/config/v2";

const config = worldToV1(configV2);

/**
 * Turns the typed data into encoded data in the format expected by `world.setRecord`
 */
export function encodeTestData(testData: Data) {
  return mapObject(testData, (records, table) => {
    if (!records) return undefined;
    const tableConfig = config.tables[table];
    return records.map((record) => {
      const key = encodeKey(tableConfig.keySchema, record.key);
      const valueArgs = encodeValueArgs(tableConfig.valueSchema, record.value);
      const fieldLayout = valueSchemaToFieldLayoutHex(tableConfig.valueSchema);

      return {
        key,
        ...valueArgs,
        fieldLayout,
      };
    });
  }) as EncodedData<typeof testData>;
}
