import { GenericTable } from "@latticexyz/services/protobuf/ts/mode/mode";
import { SchemaType } from "@latticexyz/schema-type";
import { decodeValue } from "../schemas/decodeValue";

export function getBlockNumberFromModeTable(table: GenericTable): number {
  if (table.cols[0] !== "block_number") throw new Error("Table does not contain block_number column");
  return Number(decodeValue(SchemaType.UINT256, table.rows[0].values[0]));
}
