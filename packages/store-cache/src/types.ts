import { AsyncTupleDatabaseClient, AsyncTupleRootTransactionApi, Unsubscribe } from "tuple-database";
import { FieldData, FullSchemaConfig, StoreConfig } from "@latticexyz/store";
import { AbiTypeToPrimitiveType } from "@latticexyz/schema-type/deprecated";

type FieldTypeToPrimitiveType<T extends FieldData<string>> = AbiTypeToPrimitiveType<T> extends never
  ? T extends `${string}[${string}]` // FieldType might include Enums and Enum arrays, which are mapped to uint8/uint8[]
    ? number[] // Map enum arrays to `number[]`
    : number // Map enums to `number`
  : AbiTypeToPrimitiveType<T>;

/** Map a table schema like `{ value: "uint256 "}` to its primitive TypeScript types like `{ value: bigint }`*/
export type SchemaToPrimitives<T extends FullSchemaConfig> = { [key in keyof T]: FieldTypeToPrimitiveType<T[key]> };

export type Tables<C extends StoreConfig> = {
  [Namespace in keyof C["namespaces"]]: {
    [Name in keyof C["namespaces"][Namespace]["tables"]]: {
      keyTuple: SchemaToPrimitives<C["namespaces"][Namespace]["tables"][Name]["keySchema"]>;
      value: SchemaToPrimitives<C["namespaces"][Namespace]["tables"][Name]["schema"]>;
    };
  };
};

export type Key<
  C extends StoreConfig,
  Namespace extends keyof Tables<C>,
  Name extends keyof Tables<C>[Namespace]
> = Tables<C>[Namespace][Name]["keyTuple"];
export type Value<
  C extends StoreConfig,
  Namespace extends keyof Tables<C>,
  Name extends keyof Tables<C>[Namespace]
> = Tables<C>[Namespace][Name]["value"];
export type KeyValue<
  C extends StoreConfig,
  Namespace extends keyof Tables<C>,
  Name extends keyof Tables<C>[Namespace]
> = {
  key: Key<C, Namespace, Name>;
  value: Value<C, Namespace, Name>;
};

export type DatabaseClient<C extends StoreConfig> = {
  /** Utils for every table with the table argument prefilled */
  tables: {
    [Namespace in keyof C["namespaces"]]: {
      [Name in keyof C["namespaces"][Namespace]["tables"]]: {
        set: (
          key: Key<C, Namespace, Name>,
          value: Partial<Value<C, Namespace, Name>>,
          options?: SetOptions
        ) => Promise<void>;
        get: (key: Key<C, Namespace, Name>) => Promise<Value<C, Namespace, Name>>;
        remove: (key: Key<C, Namespace, Name>, options?: RemoveOptions) => Promise<void>;
        subscribe: (
          callback: SubscriptionCallback<C, Namespace, Name>,
          // Omitting the namespace and table config option because it is prefilled when calling subscribe via the client
          filter?: Omit<FilterOptions<C, Table>, "table" | "namespace">
        ) => Promise<Unsubscribe>;
        scan: <Table extends string = keyof C["tables"] & string>(
          filter?: Omit<FilterOptions<C, Table>, "table" | "namespace">
        ) => Promise<ScanResult<C, Table>>;
      };
    };
  };
} & {
  /** Utils to set a custom table value */
  set: <Table extends string = keyof C["tables"] & string>(
    namespace: string,
    table: Table,
    key: Key<C, Table>,
    value: Partial<Value<C, Table>>,
    options?: SetOptions
  ) => Promise<void>;
  get: <Table extends string = keyof C["tables"] & string>(
    namespace: string,
    table: Table,
    key: Key<C, Table>
  ) => Promise<Value<C, Table>>;
  remove: <Table extends string = keyof C["tables"] & string>(
    namespace: string,
    table: Table,
    key: Key<C, Table>,
    options?: RemoveOptions
  ) => Promise<void>;
  subscribe: <Table extends string = keyof C["tables"] & string>(
    callback: SubscriptionCallback<C, Table>,
    filter?: FilterOptions<C, Table>
  ) => Promise<Unsubscribe>;
  scan: <Table extends string = keyof C["tables"] & string>(
    filter?: FilterOptions<C, Table>
  ) => Promise<ScanResult<C, Table>>;
  _tupleDatabaseClient: AsyncTupleDatabaseClient;
};

export type SetOptions<C extends StoreConfig = StoreConfig, T extends keyof C["tables"] = keyof C["tables"]> = {
  defaultValue?: Value<C, T>;
  /** Transaction to append the set operation to. If provided, the transaction will not be committed. */
  transaction?: AsyncTupleRootTransactionApi;
};

export type RemoveOptions = {
  /** Transaction to append the remove operation to. If provided, the transaction will not be committed. */
  transaction?: AsyncTupleRootTransactionApi;
};

export type SubscriptionCallback<
  C extends StoreConfig = StoreConfig,
  T extends keyof C["tables"] = keyof C["tables"]
> = (updates: Update<C, T>[]) => void;

export type FilterOptions<C extends StoreConfig = StoreConfig, T extends keyof C["tables"] = keyof C["tables"]> = {
  table: T & string;
  namespace?: string;
  key?: { [key in "gt" | "gte" | "lt" | "lte" | "eq"]?: Key<C, T> };
};

export type Update<C extends StoreConfig = StoreConfig, Table extends keyof C["tables"] = keyof C["tables"]> = {
  [key in Table]: {
    namespace: C["namespace"];
    table: key;
    set: KeyValue<C, key>[];
    remove: { key: Key<C, key> }[];
  };
}[Table];

export type ScanResult<C extends StoreConfig = StoreConfig, T extends keyof C["tables"] = keyof C["tables"]> = Array<
  KeyValue<C, T> & { namespace: C["namespace"]; table: T }
>;
