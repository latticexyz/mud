import { Table } from "@latticexyz/config";
import { Key, Stash } from "../common";
import { registerDerivedTable } from "./registerDerivedTable";
import { resourceToHex } from "@latticexyz/common";

const indexNamespace = "__stash_index";

export type IndexKey<table extends Table> = [keyof table["schema"], ...(keyof table["schema"])[]];

export type RegisterIndexArgs<table extends Table, key extends IndexKey<table>> = {
  stash: Stash;
  table: table;
  key: key;
};

type joinKey<key extends unknown[]> = key extends []
  ? ""
  : key extends [infer head, ...infer tail]
    ? head extends string
      ? `_${head}${joinKey<tail>}`
      : never
    : string;

export type RegisterIndexResult<table extends Table, key extends IndexKey<table>> = {
  [prop in keyof Table]: prop extends "key"
    ? key
    : prop extends "schema"
      ? table[prop]
      : prop extends "namespace"
        ? typeof indexNamespace
        : prop extends "namespaceLabel"
          ? typeof indexNamespace
          : prop extends "label"
            ? `${table["label"]}_${joinKey<key>}`
            : prop extends "name"
              ? `${table["label"]}_${joinKey<key>}`
              : Table[prop];
};

/**
 * An index is a simple derived table where the key is a subset of the input table's record and the record is equal to the input record.
 * For more advanced use cases, use `registerDerivedTable` instead.
 */
export function registerIndex<table extends Table, key extends IndexKey<table>>({
  stash,
  table,
  key,
}: RegisterIndexArgs<table, key>): RegisterIndexResult<table, key> {
  // Define output table
  const label = `${table["label"]}__${key.join("_")}`;
  const tableId = resourceToHex({ namespace: indexNamespace, name: label, type: "offchainTable" });
  const outputTable = {
    label,
    name: label,
    namespaceLabel: indexNamespace,
    namespace: indexNamespace,
    schema: table.schema,
    key: key as string[],
    type: "offchainTable",
    tableId,
  } as const satisfies Table;

  // Register derived table
  registerDerivedTable({
    stash,
    derivedTable: {
      input: table,
      output: outputTable,
      getKey: (record) => {
        return Object.fromEntries(key.map((k) => [k, record[k]])) as Key<typeof outputTable>;
      },
    },
  });

  return outputTable as never;
}
