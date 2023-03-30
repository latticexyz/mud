import { GenericTable } from "@latticexyz/services/protobuf/ts/mode/mode";
import { SchemaType } from "@latticexyz/schema-type";
import { decodeValue } from "../schemas/decodeValue";

export function getBlockNumberFromModeTable(table: GenericTable): number {
  // TODO: make this easier to pluck off of the rpc response? this feels complicated for a built-in, always-present thing
  return Number(decodeValue(SchemaType.UINT256, table.rows[0].values[0]));
}
