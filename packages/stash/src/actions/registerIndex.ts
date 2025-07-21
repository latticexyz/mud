import { Table } from "@latticexyz/config";
import { indexNamespace, PendingStashUpdate, Stash, TableUpdate } from "../common";
import { registerDerivedTable } from "./registerDerivedTable";
import { resourceToHex, resourceToLabel } from "@latticexyz/common";
import { registerTable } from "./registerTable";
import { getRecord } from "./getRecord";
import { getSchemaPrimitives } from "@latticexyz/protocol-parser/internal";
import { recordMatches } from "../queryFragments";

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

type getIndexTableName<table extends Table, key extends IndexKey<table>> = `${table["label"]}_${joinKey<key>}`;

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
            ? getIndexTableName<table, key>
            : prop extends "name"
              ? getIndexTableName<table, key>
              : Table[prop];
};

/**
 * An index is a simple derived table where the key is a subset of the input table's record and the record is equal to the input record.
 * For more advanced use cases use `registerDerivedTable` instead.
 */
export function registerIndex<table extends Table, key extends IndexKey<table>>({
  stash,
  table,
  key,
}: RegisterIndexArgs<table, key>): RegisterIndexResult<table, key> {
  // Register the index table
  const { label, name, namespace, namespaceLabel } = getIndexTableLabel(table, key);
  const tableId = resourceToHex({ namespace, name, type: "offchainTable" });
  const indexTable = {
    label,
    name,
    namespaceLabel,
    namespace,
    schema: { ...table.schema, index: { type: "uint32", internalType: "uint32" } },
    key: [...key, "index"] as string[],
    type: "offchainTable",
    tableId,
  } as const satisfies Table;
  registerTable({
    stash,
    table: indexTable,
  });

  // Register derivation logic
  registerDerivedTable({
    stash,
    derivedTable: {
      input: table,
      label: resourceToLabel({ namespace, name }),
      deriveUpdates: (() => {
        const countByKey: Record<string, number> = {};
        return ({ previous, current }: TableUpdate<typeof table>) => {
          const updates: PendingStashUpdate[] = [];
          // There is one record in the index table for each record in the input table.
          // When a record in the input table is updated, we need to find the corresponding index record,
          // remove it from it's previous index location, and add it to it's new index location.
          if (previous) {
            const previousKey = pick(previous, key);
            const encodedKey = Object.values(previousKey).join("|");
            const count = countByKey[encodedKey] ?? 0;
            // Search for the index record corresponding to the previous record by comparing each matching key
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
                // To avoid gaps we update the index of the last record with the index of the record we're removing
                if (i < count - 1) {
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
                countByKey[encodedKey] = count - 1;
                break;
              }
            }
          }
          // Add the new index record
          if (current) {
            const currentKey = pick(current, key);
            const encodedKey = Object.values(currentKey).join("|");
            const count = countByKey[encodedKey] ?? 0;
            updates.push({
              table: indexTable,
              key: { ...currentKey, index: count },
              value: { ...current, index: count },
            });
            countByKey[encodedKey] = count + 1;
          }

          return updates;
        };
      })(),
    },
  });

  return indexTable as never;
}

export function getIndexTableLabel<table extends Table, key extends IndexKey<table>>(
  table: table,
  key: key,
): {
  label: getIndexTableName<table, key>;
  name: getIndexTableName<table, key>;
  namespace: typeof indexNamespace;
  namespaceLabel: typeof indexNamespace;
} {
  return {
    label: `${table["label"]}__${key.join("_")}` as never,
    name: `${table["label"]}__${key.join("_")}` as never,
    namespace: indexNamespace,
    namespaceLabel: indexNamespace,
  };
}

function pick<table extends Table, key extends IndexKey<table>>(
  record: getSchemaPrimitives<table["schema"]>,
  key: key,
): { [prop in key[number]]: getSchemaPrimitives<table["schema"]>[prop] } {
  return Object.fromEntries(key.map((k) => [k, record[k]])) as never;
}
