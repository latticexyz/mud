import { getSchemaPrimitives } from "@latticexyz/protocol-parser/internal";
import { Table } from "@latticexyz/config";
import { QueryFragment } from "./queryFragments";

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

type namespacedTableLabels<config extends StoreConfig> = keyof {
  [key in keyof config["namespaces"] as `${key & string}__${keyof config["namespaces"][key]["tables"] & string}`]: null;
};

type namespacedTables<config extends StoreConfig> = {
  [key in namespacedTableLabels<config>]: key extends `${infer namespaceLabel}__${infer tableLabel}`
    ? config["namespaces"][namespaceLabel]["tables"][tableLabel]
    : never;
};

export type getAllTables<config extends StoreConfig> = namespacedTables<config>[keyof namespacedTables<config>];

export type getConfig<
  config extends StoreConfig,
  namespace extends keyof config["namespaces"] | undefined,
  table extends keyof config["namespaces"][namespace extends undefined ? "" : namespace]["tables"],
> = Omit<config["namespaces"][namespace extends undefined ? "" : namespace]["tables"][table], "codegen" | "deploy">;

// Variation of getKeySchema that does not validate that keys are StaticAbiType since it's not required in stash
type getKeySchema<table extends Table> = {
  readonly [fieldName in Extract<keyof table["schema"], table["key"][number]>]: table["schema"][fieldName];
};

/**
 * A Key is the unique identifier for a row in the table.
 */
export type Key<table extends Table = Table> = getSchemaPrimitives<getKeySchema<table>>;

/**
 * A map from encoded key to decoded key
 */
export type Keys<table extends Table = Table> = {
  [encodedKey: string]: Key<table>;
};

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

export type TableRecords<table extends Table = Table> = {
  readonly [key: string]: TableRecord<table>;
};

export type MutableTableRecords<table extends Table = Table> = {
  [key: string]: TableRecord<table>;
};

export type StoreRecords<config extends StoreConfig = StoreConfig> = {
  readonly [namespace in getNamespaces<config>]: {
    readonly [table in getNamespaceTables<config, namespace>]: TableRecords<getConfig<config, namespace, table>>;
  };
};

export type MutableStoreRecords<config extends StoreConfig = StoreConfig> = {
  -readonly [namespace in getNamespaces<config>]: {
    -readonly [table in getNamespaceTables<config, namespace>]: MutableTableRecords<
      getConfig<config, namespace, table>
    >;
  };
};

export type DerivedTable<input extends Table = Table> = {
  readonly input: input;
  readonly label: string;
  readonly deriveUpdates: (update: TableUpdate<input>) => PendingStashUpdate[];
};

export type DerivedTables = {
  [inputNamespaceLabel: string]: {
    [inputTableLabel: string]: {
      [derivedTableLabel: string]: DerivedTable;
    };
  };
};

export type State<config extends StoreConfig = StoreConfig> = {
  readonly config: {
    readonly [namespace in getNamespaces<config>]: {
      readonly [table in getNamespaceTables<config, namespace>]: getConfig<config, namespace, table>;
    };
  };
  readonly records: StoreRecords<config>;
};

export type MutableState<config extends StoreConfig = StoreConfig> = {
  config: {
    -readonly [namespace in getNamespaces<config>]: {
      -readonly [table in getNamespaceTables<config, namespace>]: getConfig<config, namespace, table>;
    };
  };
  records: MutableStoreRecords<config>;
};

export type PendingStashUpdate<table extends Table = Table> = {
  table: table;
  key: Key<table>;
  value: undefined | Partial<TableRecord<table>>;
};

export type TableUpdate<table extends Table = Table> = {
  table: table;
  key: Key<table>;
  previous: TableRecord<table> | undefined;
  current: TableRecord<table> | undefined;
};

export type TableUpdates<table extends Table = Table> = TableUpdate<table>[];

export type TableUpdatesSubscriber<table extends Table = Table> = (updates: TableUpdates<table>) => void;

export type TableSubscribers = {
  [namespaceLabel: string]: {
    [tableLabel: string]: Set<TableUpdatesSubscriber>;
  };
};

export type ConfigUpdate = { previous: Table | undefined; current: Table };

export type StoreUpdates<config extends StoreConfig = StoreConfig> =
  | {
      type: "config";
      updates: ConfigUpdate[];
    }
  | {
      type: "records";
      updates: TableUpdates<getAllTables<config>>;
    };

export type StoreUpdatesSubscriber<config extends StoreConfig = StoreConfig> = (updates: StoreUpdates<config>) => void;

export type StoreSubscribers<config extends StoreConfig = StoreConfig> = Set<StoreUpdatesSubscriber<config>>;

export type Stash<config extends StoreConfig = StoreConfig> = {
  /**
   * Get a readonly reference to the current state
   */
  readonly get: () => State<config>;
  /**
   * Internal references for interacting with the state.
   * @internal
   * @deprecated Do not use this internal reference externally.
   */
  readonly _: {
    readonly tableSubscribers: TableSubscribers;
    readonly storeSubscribers: StoreSubscribers;
    readonly state: MutableState<config>;
    readonly derivedTables: DerivedTables;
  };
};

export const indexNamespace = "__stash_index";
