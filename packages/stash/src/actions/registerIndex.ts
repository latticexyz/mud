import { Table } from "@latticexyz/config";
import { PendingStashUpdate, Stash, TableUpdate } from "../common";
import { registerDerivedTable } from "./registerDerivedTable";
import { resourceToHex } from "@latticexyz/common";
import { registerTable } from "./registerTable";
import { getRecord } from "./getRecord";
import { getSchemaPrimitives } from "@latticexyz/protocol-parser/internal";
import { recordMatches } from "../queryFragments";

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
    ? [...key, "index"]
    : prop extends "schema"
      ? table[prop] & { index: { type: "uint32"; internalType: "uint32" } }
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
  // Register the index table
  const label = `${table["label"]}__${key.join("_")}`;
  const tableId = resourceToHex({ namespace: indexNamespace, name: label, type: "offchainTable" });
  const indexTable = {
    label,
    name: label,
    namespaceLabel: indexNamespace,
    namespace: indexNamespace,
    schema: { ...table.schema, index: { type: "uint32", internalType: "uint32" } },
    key: [...key, "index"] as string[],
    type: "offchainTable",
    tableId,
  } as const satisfies Table;
  registerTable({
    stash,
    table: indexTable,
  });

  // Register derived table
  registerDerivedTable({
    stash,
    derivedTable: {
      input: table,
      label: `${indexNamespace}__${label}`,
      deriveUpdates: (() => {
        let count = 0;
        return ({ previous, current }: TableUpdate<typeof table>) => {
          // Remove the previous index record
          const updates: PendingStashUpdate[] = [];
          if (previous) {
            // Find the previous index record
            const previousKey = pick(previous, key);
            for (let i = 0; i < count; i++) {
              const previousIndexRecord = getRecord({
                stash,
                table: indexTable,
                key: { ...previousKey, index: i },
              });
              if (recordMatches(previous, previousIndexRecord)) {
                // Remove the previous index record
                updates.push({
                  table: indexTable,
                  key: { ...previousKey, index: i },
                  value: undefined,
                });
                if (i < count - 1) {
                  // Update the index of the last record if it exists
                  const lastIndexRecord = getRecord({
                    stash,
                    table: indexTable,
                    key: { ...previousKey, index: count - 1 },
                  });
                  updates.push({
                    table: indexTable,
                    key: { ...previousKey, index: count - 1 },
                    value: undefined,
                  });
                  updates.push({
                    table: indexTable,
                    key: { ...previousKey, index: i },
                    value: { ...lastIndexRecord, index: i },
                  });
                }
                count--;
                break;
              }
            }
          }
          // Add the new index record
          if (current) {
            const currentKey = pick(current, key);
            updates.push({
              table: indexTable,
              key: { ...currentKey, index: count },
              value: { ...current, index: count },
            });
            count++;
          }

          return updates;
        };
      })(),
    },
  });

  return indexTable as never;
}

function pick<table extends Table, key extends IndexKey<table>>(
  record: getSchemaPrimitives<table["schema"]>,
  key: key,
): { [prop in key[number]]: getSchemaPrimitives<table["schema"]>[prop] } {
  return Object.fromEntries(key.map((k) => [k, record[k]])) as never;
}
