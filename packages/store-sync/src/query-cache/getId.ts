import { Hex, concatHex } from "viem";

type GetIdOptions = {
  readonly tableId: Hex;
  readonly keyTuple: readonly Hex[];
};

export function getId({ tableId, keyTuple }: GetIdOptions): string {
  return `${tableId}:${concatHex(keyTuple)}`;
}
