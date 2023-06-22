import { mapObject } from "@latticexyz/utils";
import { encodePacked, encodeAbiParameters, toHex } from "viem";

// Note: this expects the config to not use shortcuts but the full definitions for table schemas
import config from "../../contracts/mud.config";

// TODO: ideally this should be strongly typed to avoid mismatches between
// test data and expected schema
export type Data = { [key: string]: Array<{ key: Record<string, any>; value: Record<string, any> }> };
export type EncodedData = { [key: string]: Array<{ key: string[]; value: string }> };

export const testData = {
  Number: [{ key: {}, value: { value: 42 } }],
} satisfies Data;

// TODO: add ts version of encoding functions based on schemas
// in order to add support for dynamic schema values in tests
export const encodedTestData = mapObject(testData, (records, table) =>
  records.map((record) => ({
    key: Object.values(record.key).map((key) => encodeAbiParameters([{ type: "bytes32" }], [toHex(key as any)])),
    value: encodePacked(Object.values(config.tables[table].schema), Object.values(record.value)),
  }))
) as EncodedData;
