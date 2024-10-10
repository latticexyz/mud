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

// TODO: move to our own useQuery so we can control the query key

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
}): UseReadContractReturnType<
  typeof IStoreReadAbi,
  "getRecord",
  [Hex, readonly Hex[]],
  getSchemaPrimitives<table["schema"]>
> {
  return useReadContract(
    table && key && opts.query?.enabled !== false
      ? {
          ...opts,
          abi: IStoreReadAbi,
          functionName: "getRecord",
          args: [table.tableId, getKeyTuple(table, key)],
          query: {
            ...opts.query,
            select: (data) => ({
              ...key,
              ...decodeValueArgs(getSchemaTypes(getValueSchema(table)), {
                staticData: data[0],
                encodedLengths: data[1],
                dynamicData: data[2],
              }),
            }),
          },
        }
      : {},
  );
}
