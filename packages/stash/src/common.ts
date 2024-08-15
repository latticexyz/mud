import { QueryFragment } from "./queryFragments";
import { Table } from "@latticexyz/config";
import { getKeySchema, getSchemaPrimitives } from "@latticexyz/protocol-parser/internal";

export type StoreConfig = {
  namespaces: {
    [namespaceLabel: string]: {
      tables: {
        [tableLabel: string]: Table;
      };
    };
  };
};

export type getNamespaces<config extends StoreConfig> = keyof config["namespaces"];

export type getNamespaceTables<
  config extends StoreConfig,
  namespace extends keyof config["namespaces"],
> = keyof config["namespaces"][namespace]["tables"];

export type getTableConfig<
  config extends StoreConfig,
  namespace extends keyof config["namespaces"] | undefined,
  table extends keyof config["namespaces"][namespace extends undefined ? "" : namespace]["tables"],
> = Omit<config["namespaces"][namespace extends undefined ? "" : namespace]["tables"][table], "codegen" | "deploy">;

/**
 * A Key is the unique identifier for a row in the table.
 */
export type Key<table extends Table = Table> = getSchemaPrimitives<getKeySchema<table>>;

/**
 * A map from encoded key to decoded key
 */
export type Keys<table extends Table = Table> = { [encodedKey: string]: Key<table> };

export type CommonQueryResult = {
  /**
   * Readyonly, mutable, includes currently matching keys.
   */
  keys: Readonly<Keys>;
};

export type CommonQueryOptions = {
  initialKeys?: Keys;
};

export type Query = readonly [QueryFragment, ...QueryFragment[]];

type OmitNeverKeys<T> = { [key in keyof T as T[key] extends never ? never : key]: T[key] };

export type getQueryConfig<query extends Query> = {
  namespaces: {
    [namespaceLabel in query[number]["table"]["namespaceLabel"]]: {
      tables: OmitNeverKeys<{
        [label in query[number]["table"]["label"]]: query[number]["table"] & {
          namespaceLabel: namespaceLabel;
          label: label;
        };
      }>;
    };
  };
};

export type Unsubscribe = () => void;

/**
 * A TableRecord is one row of the table. It includes both the key and the value.
 */
export type TableRecord<table extends Table = Table> = getSchemaPrimitives<table["schema"]>;

export type TableLabel<config extends StoreConfig = StoreConfig, namespace extends getNamespaces<config> = string> = {
  label: getNamespaceTables<config, namespace>;
  namespace?: namespace;
};

export type TableRecords<table extends Table = Table> = { readonly [key: string]: TableRecord<table> };

export type MutableTableRecords<table extends Table = Table> = { [key: string]: TableRecord<table> };

export type StoreRecords<config extends StoreConfig = StoreConfig> = {
  readonly [namespace in getNamespaces<config>]: {
    readonly [table in getNamespaceTables<config, namespace>]: TableRecords<getTableConfig<config, namespace, table>>;
  };
};

export type MutableStoreRecords<config extends StoreConfig = StoreConfig> = {
  -readonly [namespace in getNamespaces<config>]: {
    -readonly [table in getNamespaceTables<config, namespace>]: MutableTableRecords<
      getTableConfig<config, namespace, table>
    >;
  };
};

export type State<config extends StoreConfig = StoreConfig> = {
  readonly config: {
    readonly [namespace in getNamespaces<config>]: {
      readonly [table in getNamespaceTables<config, namespace>]: getTableConfig<config, namespace, table>;
    };
  };
  readonly records: StoreRecords<config>;
};

export type MutableState<config extends StoreConfig = StoreConfig> = {
  config: {
    -readonly [namespace in getNamespaces<config>]: {
      -readonly [table in getNamespaceTables<config, namespace>]: getTableConfig<config, namespace, table>;
    };
  };
  records: MutableStoreRecords<config>;
};

export type TableUpdate<table extends Table = Table> = {
  prev: TableRecord<table> | undefined;
  current: TableRecord<table> | undefined;
};

export type TableUpdates<table extends Table = Table> = { [key: string]: TableUpdate<table> };

export type TableUpdatesSubscriber<table extends Table = Table> = (updates: TableUpdates<table>) => void;

export type TableSubscribers = {
  [namespace: string]: {
    [table: string]: Set<TableUpdatesSubscriber>;
  };
};

export type ConfigUpdate = { prev: Table | undefined; current: Table };

export type StoreUpdates<config extends StoreConfig = StoreConfig> = {
  config: {
    [namespace: string]: {
      [table: string]: ConfigUpdate;
    };
  };
  records: {
    [namespace in getNamespaces<config>]: {
      [table in getNamespaceTables<config, namespace>]: TableUpdates<getTableConfig<config, namespace, table>>;
    };
  } & {
    [namespace: string]: {
      [table: string]: TableUpdates;
    };
  };
};

export type StoreUpdatesSubscriber<config extends StoreConfig = StoreConfig> = (updates: StoreUpdates<config>) => void;

export type StoreSubscribers<config extends StoreConfig = StoreConfig> = Set<StoreUpdatesSubscriber<config>>;

export type Stash<config extends StoreConfig = StoreConfig> = {
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
