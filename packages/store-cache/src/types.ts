import { TupleDatabaseClient, TupleRootTransactionApi, Unsubscribe } from "tuple-database";
import { FieldData, FullSchemaConfig, StoreConfig } from "@latticexyz/store";
import { AbiTypeToPrimitiveType } from "@latticexyz/schema-type";

type FieldTypeToPrimitiveType<T extends FieldData<string>> = AbiTypeToPrimitiveType<T> extends never
  ? T extends `${string}[${string}]` // FieldType might include Enums and Enum arrays, which are mapped to uint8/uint8[]
    ? number[] // Map enum arrays to `number[]`
    : number // Map enums to `number`
  : AbiTypeToPrimitiveType<T>;

/** Map a table schema like `{ value: "uint256 "}` to its primitive TypeScript types like `{ value: bigint }`*/
export type SchemaToPrimitives<T extends FullSchemaConfig> = { [key in keyof T]: FieldTypeToPrimitiveType<T[key]> };

export type Tables<C extends StoreConfig> = {
  [key in keyof C["tables"]]: {
    keyTuple: SchemaToPrimitives<C["tables"][key]["keySchema"]>;
    value: SchemaToPrimitives<C["tables"][key]["schema"]>;
  };
};

export type Key<C extends StoreConfig, Table extends keyof Tables<C>> = Tables<C>[Table]["keyTuple"];
export type Value<C extends StoreConfig, Table extends keyof Tables<C>> = Tables<C>[Table]["value"];
export type KeyValue<C extends StoreConfig, Table extends keyof Tables<C>> = {
  key: Key<C, Table>;
  value: Value<C, Table>;
};

export type DatabaseClient<C extends StoreConfig> = {
  /** Utils for every table with the table argument prefilled */
  tables: {
    [Table in keyof C["tables"]]: {
      set: (key: Key<C, Table>, value: Partial<Value<C, Table>>, options?: SetOptions) => TupleRootTransactionApi;
      get: (key: Key<C, Table>) => Value<C, Table>;
      remove: (key: Key<C, Table>, options?: RemoveOptions) => TupleRootTransactionApi;
      subscribe: (
        callback: SubscriptionCallback<C, Table>,
        // Omitting the namespace and table config option because it is prefilled when calling subscribe via the client
        filter?: Omit<FilterOptions<C, Table>, "table" | "namespace">
      ) => Unsubscribe;
      scan: <Table extends string = keyof C["tables"] & string>(
        filter?: Omit<FilterOptions<C, Table>, "table" | "namespace">
      ) => ScanResult<C, Table>;
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
  ) => TupleRootTransactionApi;
  get: <Table extends string = keyof C["tables"] & string>(
    namespace: string,
    table: Table,
    key: Key<C, Table>
  ) => Value<C, Table>;
  remove: <Table extends string = keyof C["tables"] & string>(
    namespace: string,
    table: Table,
    key: Key<C, Table>,
    options?: RemoveOptions
  ) => TupleRootTransactionApi;
  subscribe: <Table extends string = keyof C["tables"] & string>(
    callback: SubscriptionCallback<C, Table>,
    filter?: FilterOptions<C, Table>
  ) => Unsubscribe;
  scan: <Table extends string = keyof C["tables"] & string>(filter?: FilterOptions<C, Table>) => ScanResult<C, Table>;
  _tupleDatabaseClient: TupleDatabaseClient;
};

export type SetOptions<C extends StoreConfig = StoreConfig, T extends keyof C["tables"] = keyof C["tables"]> = {
  defaultValue?: Value<C, T>;
  /** Transaction to append the set operation to. If provided, the transaction will not be committed. */
  transaction?: TupleRootTransactionApi;
};

export type RemoveOptions = {
  /** Transaction to append the remove operation to. If provided, the transaction will not be committed. */
  transaction?: TupleRootTransactionApi;
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
    namespace: C["tables"][Table]["namespace"];
    table: key;
    set: KeyValue<C, key>[];
    remove: { key: Key<C, key> }[];
  };
}[Table];

export type ScanResult<C extends StoreConfig = StoreConfig, T extends keyof C["tables"] = keyof C["tables"]> = Array<
  KeyValue<C, T> & { namespace: C["tables"][T]["namespace"]; table: T }
>;
