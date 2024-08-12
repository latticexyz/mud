import { Hex } from "viem";
import { QueryFragment } from "./queryFragments";
import { Table } from "@latticexyz/config";
import { Store as StoreConfig } from "@latticexyz/store/config/v2";
import { getSchemaPrimitives } from "@latticexyz/protocol-parser/internal";

/**
 * A Key is the unique identifier for a row in the table.
 */
export type Key = { [field: string]: number | Hex | bigint | boolean | string };

/**
 * A map from encoded key to decoded key
 */
export type Keys = { [encodedKey: string]: Key };

export type CommonQueryResult = {
  /**
   * Readyonly, mutable, includes currently matching keys.
   */
  keys: Readonly<Keys>;
};

export type CommonQueryOptions = {
  initialKeys?: Keys;
};

export type Query = [QueryFragment, ...QueryFragment[]];

export type Unsubscribe = () => void;

/**
 * A TableRecord is one row of the table. It includes both the key and the value.
 */
export type TableRecord<table extends Table = Table> = getSchemaPrimitives<table["schema"]>;

export type TableLabel = { label: string; namespace?: string };

export type TableRecords<table extends Table = Table> = { readonly [key: string]: TableRecord<table> };

export type MutableTableRecords<table extends Table = Table> = { [key: string]: TableRecord<table> };

type getNamespaces<config extends StoreConfig> = keyof config["namespaces"];

type getTables<
  config extends StoreConfig,
  namespace extends keyof config["namespaces"],
> = keyof config["namespaces"][namespace]["tables"];

type getTable<
  config extends StoreConfig,
  namespace extends keyof config["namespaces"],
  table extends keyof config["namespaces"][namespace]["tables"],
> = Omit<config["namespaces"][namespace]["tables"][table], "codegen" | "deploy">;

export type StoreRecords<config extends StoreConfig = StoreConfig> = {
  readonly [namespace in getNamespaces<config>]: {
    readonly [table in getTables<config, namespace>]: TableRecords<getTable<config, namespace, table>>;
  };
};

export type MutableStoreRecords<config extends StoreConfig = StoreConfig> = {
  [namespace in getNamespaces<config>]: {
    [table in getTables<config, namespace>]: MutableTableRecords<getTable<config, namespace, table>>;
  };
};

export type State<config extends StoreConfig = StoreConfig> = {
  readonly config: {
    readonly [namespace in getNamespaces<config>]: {
      readonly [table in getTables<config, namespace>]: getTable<config, namespace, table>;
    };
  };
  readonly records: StoreRecords<config>;
};

export type MutableState<config extends StoreConfig = StoreConfig> = {
  config: {
    [namespace in getNamespaces<config>]: {
      [table in getTables<config, namespace>]: getTable<config, namespace, table>;
    };
  };
  records: MutableStoreRecords<config>;
};

export type TableUpdate = { prev: TableRecord | undefined; current: TableRecord | undefined };

export type TableUpdates = { [key: string]: TableUpdate };

export type TableUpdatesSubscriber = (updates: TableUpdates) => void;

export type TableSubscribers = {
  [namespace: string]: {
    [table: string]: Set<TableUpdatesSubscriber>;
  };
};

export type ConfigUpdate = { prev: Table | undefined; current: Table };

export type StoreUpdates = {
  config: {
    [namespace: string]: {
      [table: string]: ConfigUpdate;
    };
  };
  records: {
    [namespace: string]: {
      [table: string]: TableUpdates;
    };
  };
};

export type StoreUpdatesSubscriber = (updates: StoreUpdates) => void;

export type StoreSubscribers = Set<StoreUpdatesSubscriber>;

export type Store<config extends StoreConfig = StoreConfig> = {
  /**
   * Get a readonly reference to the current state
   */
  get: () => State<config>;
  /**
   * Internal references for interacting with the state.
   * @internal
   * @deprecated Do not use this internal reference externally.
   */
  _: {
    tableSubscribers: TableSubscribers;
    storeSubscribers: StoreSubscribers;
    state: MutableState<config>;
  };
};

export function withDefaultNamespace({ namespace, label }: TableLabel): Required<TableLabel> {
  return {
    namespace: namespace ?? "",
    label,
  };
}
