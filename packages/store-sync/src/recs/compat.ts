import { StaticAbiType, AbiType, Table } from "@latticexyz/config";
import { Hex } from "viem";
import { World as RecsWorld } from "@latticexyz/recs";
import { StorageAdapter } from "../common";
import { satisfy } from "@latticexyz/common/type-utils";
import { InternalComponents } from "./defineInternalComponents";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";
import { TablesToComponents } from "./tablesToComponents";
import { createStorageAdapter } from "./createStorageAdapter";
import { mapObject } from "@latticexyz/common/utils";
import { hexToResource } from "@latticexyz/common";

/** @deprecated */
type deprecatedTableToTable<table extends DeprecatedTable> = satisfy<
  Table,
  Pick<table, "tableId" | "namespace" | "name"> & {
    type: "table" | "offchainTable";
    key: readonly (keyof table["keySchema"] & string)[];
    schema: {
      [k in keyof table["keySchema"] & keyof table["valueSchema"]]: k extends keyof table["keySchema"]
        ? {
            type: table["keySchema"][k]["type"];
            internalType: table["keySchema"][k]["type"];
          }
        : {
            type: table["valueSchema"][k]["type"];
            internalType: table["valueSchema"][k]["type"];
          };
    };
  }
>;

/** @deprecated */
type deprecatedTablesToTables<tables extends Record<string, DeprecatedTable>> = {
  [k in keyof tables]: deprecatedTableToTable<tables[k]>;
};

/** @deprecated Use `key` and `schema` on `Table` from `@latticexyz/config` instead. */
export type KeySchema = {
  readonly [k: string]: {
    readonly type: StaticAbiType;
  };
};

/** @deprecated Use `schema` on `Table` from `@latticexyz/config` instead. */
export type ValueSchema = {
  readonly [k: string]: {
    readonly type: AbiType;
  };
};

/** @deprecated Use `Table` from `@latticexyz/config` instead. This is just here for backwards compatibility. */
export type DeprecatedTable = {
  readonly tableId: Hex;
  readonly namespace: string;
  readonly name: string;
  readonly keySchema: KeySchema;
  readonly valueSchema: ValueSchema;
};

/** @deprecated Use `CreateStorageAdapterOptions` instead. */
export type RecsStorageOptions<tables extends Record<string, DeprecatedTable>> = {
  world: RecsWorld;
  tables: tables;
  shouldSkipUpdateStream?: () => boolean;
};

/** @deprecated Use `CreateStorageAdapterResult` instead. */
export type RecsStorageAdapter<tables extends Record<string, DeprecatedTable>> = {
  storageAdapter: StorageAdapter;
  components: TablesToComponents<deprecatedTablesToTables<tables>> &
    TablesToComponents<typeof storeConfig.tables> &
    TablesToComponents<typeof worldConfig.tables> &
    InternalComponents;
};

/** @deprecated Use `createStorageAdapter` instead. */
export function recsStorage<tables extends Record<string, DeprecatedTable>>({
  tables,
  ...opts
}: RecsStorageOptions<tables>): RecsStorageAdapter<tables> {
  return createStorageAdapter({
    ...opts,
    tables: mapObject(tables, (table) => {
      const { type } = hexToResource(table.tableId);
      return {
        ...table,
        type: type as never,
        key: Object.keys(table.keySchema),
        schema: {
          ...mapObject(table.keySchema, ({ type }) => ({ type, internalType: type }) as never),
          ...mapObject(table.valueSchema, ({ type }) => ({ type, internalType: type }) as never),
        } as deprecatedTableToTable<typeof table>["schema"],
      };
    }),
  });
}
