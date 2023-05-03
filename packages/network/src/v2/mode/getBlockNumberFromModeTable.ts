import { GenericTable } from "@latticexyz/services/mode";
import { decodeValueV2 } from "../schemas/decodeValue";

export function getBlockNumberFromModeTable(table: GenericTable): number {
  if (table.cols[1] !== "block_number") throw new Error("Table does not contain block_number column");
  return Number(decodeValueV2(table.rows[0].values[1]));
}
