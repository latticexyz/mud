import { TableData } from "@latticexyz/services/mode";
import { SchemaType } from "@latticexyz/schema-type/deprecated";
import { decodeValue } from "../schemas/decodeValue";

export function getBlockNumberFromModeTable(tableData: TableData): number {
  // First column is the chain followed by the block number.
  if (tableData.cols[1] !== "block_number") throw new Error("Table does not contain block_number column");
  return Number(decodeValue(SchemaType.UINT256, tableData.rows[0].values[1]));
}
