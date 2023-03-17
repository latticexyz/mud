import { GenericTable } from "@latticexyz/services/protobuf/ts/mode/mode";
import { SchemaType } from "@latticexyz/schema-type";
import { decodeValue } from "../schemas/decodeValue";

export function getBlockNumberFromModeTable(table: GenericTable): number {
  // TODO: figure out how to get correct return type from `decodeValue`
  // TODO: downcasting this to number, because that's what sync worker, this may result in data loss for large block numbers
  // TODO: make this easier to pluck off of the rpc response? this feels complicated for a built-in, always-present thing
  return Number(decodeValue(SchemaType.UINT256, table.rows[0].values[0]));
}
