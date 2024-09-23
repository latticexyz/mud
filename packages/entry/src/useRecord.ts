import { Table } from "@latticexyz/config";
import { schemaToPrimitives } from "./utils/schemaToPrimitives";
import { UseReadContractParameters, UseReadContractReturnType, useReadContract } from "wagmi";
import IStoreReadAbi from "@latticexyz/store/out/IStoreRead.sol/IStoreRead.abi.json";
import { encodeKeyTuple } from "./utils/encodeKeyTuple";
import { decodeValueArgs, getKeySchema, getSchemaTypes, getValueSchema } from "@latticexyz/protocol-parser/internal";
import { Hex } from "viem";

export function useRecord<table extends Table>({
  table,
  key,
  ...opts
}: Omit<
  UseReadContractParameters<typeof IStoreReadAbi, "getRecord", [Hex, readonly Hex[]]>,
  "abi" | "functionName" | "args"
> & {
  readonly table?: table;
  readonly key?: schemaToPrimitives<getKeySchema<table>>;
}): UseReadContractReturnType<typeof IStoreReadAbi, "getRecord", [Hex, readonly Hex[]]> & {
  readonly record: schemaToPrimitives<table["schema"]> | undefined;
} {
  const result = useReadContract(
    table && key && opts.query?.enabled !== false
      ? {
          ...opts,
          abi: IStoreReadAbi,
          functionName: "getRecord",
          args: [table.tableId, encodeKeyTuple(getKeySchema(table), key)],
        }
      : {},
  );

  return {
    ...result,
    record:
      table && key && result.data != null
        ? {
            ...key,
            ...decodeValueArgs(getSchemaTypes(getValueSchema(table)), {
              staticData: result.data[0],
              encodedLengths: result.data[1],
              dynamicData: result.data[2],
            }),
          }
        : undefined,
  };
}
