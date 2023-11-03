import { Hex, concatHex } from "viem";

type GetIdOptions = {
  readonly tableId: Hex;
  readonly keyTuple: readonly Hex[];
};

export function getId({ tableId, keyTuple }: GetIdOptions): string {
  // TODO: pass in keyTuple directly once types are fixed (https://github.com/wagmi-dev/viem/pull/1417)
  return `${tableId}:${concatHex([...keyTuple])}`;
}
