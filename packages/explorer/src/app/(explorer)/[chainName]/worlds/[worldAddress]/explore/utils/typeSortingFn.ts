import { bigIntSort } from "@latticexyz/common/utils";
import { AbiType } from "@latticexyz/config";
import { Row } from "@tanstack/react-table";

export function typeSortingFn(
  rowA: Row<Record<string, unknown>>,
  rowB: Row<Record<string, unknown>>,
  columnId: string,
  type?: AbiType,
) {
  const a = rowA.getValue(columnId);
  const b = rowB.getValue(columnId);

  if (type?.startsWith("uint") || type?.startsWith("int")) {
    const aBig = BigInt(a?.toString() || "0");
    const bBig = BigInt(b?.toString() || "0");
    return bigIntSort(aBig, bBig);
  }

  if (typeof a === "bigint" || typeof b === "bigint") {
    const aBig = BigInt(a?.toString() || "0");
    const bBig = BigInt(b?.toString() || "0");
    return bigIntSort(aBig, bBig);
  }

  if (a == null) return 1;
  if (b == null) return -1;

  return a < b ? -1 : a > b ? 1 : 0;
}
