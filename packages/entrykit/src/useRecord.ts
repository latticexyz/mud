import { Table } from "@latticexyz/config";
import { UseReadContractParameters, UseReadContractReturnType, useReadContract } from "wagmi";
import IStoreReadAbi from "@latticexyz/store/out/IStoreRead.sol/IStoreRead.abi.json";
import {
  decodeValueArgs,
  getKeySchema,
  getKeyTuple,
  getSchemaPrimitives,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
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
  readonly key?: getSchemaPrimitives<getKeySchema<table>>;
}): UseReadContractReturnType<typeof IStoreReadAbi, "getRecord", [Hex, readonly Hex[]]> & {
  readonly record: getSchemaPrimitives<table["schema"]> | undefined;
} {
  const result = useReadContract(
    table && key && opts.query?.enabled !== false
      ? {
          ...opts,
          abi: IStoreReadAbi,
          functionName: "getRecord",
          args: [table.tableId, getKeyTuple(table, key)],
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
