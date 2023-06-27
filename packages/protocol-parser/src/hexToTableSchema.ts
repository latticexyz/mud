import { Hex, sliceHex } from "viem";
import { TableSchema } from "./common";
import { Schema } from "./Schema";

export function hexToTableSchema(data: Hex): TableSchema {
  const valueSchema = Schema.fromHex(sliceHex(data, 0, 32));
  const keySchema = Schema.fromHex(sliceHex(data, 32, 64));
  return {
    keySchema,
    valueSchema,
  };
}
