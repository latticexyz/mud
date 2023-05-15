import { GenericTable } from "@latticexyz/services/mode";
import { decodeValueJSON } from "../schemas/decodeValue";

export function getBlockNumberFromModeTable(table: GenericTable): number {
  // First column is the chain  followed by the block number.
  if (table.cols[1] !== "block_number") throw new Error("Table does not contain block_number column");
  return Number(decodeValueJSON(table.rows[0].values[1]));
}
