import { Hex, sliceHex } from "viem";
import { TableSchema } from "./common";
import { hexToSchema } from "./hexToSchema";

export function hexToTableSchema(data: Hex): TableSchema {
  const valueSchema = hexToSchema(sliceHex(data, 0, 32));
  const keySchema = hexToSchema(sliceHex(data, 32, 64));
  return {
    keySchema,
    valueSchema,
  };
}
