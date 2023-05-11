import { TupleDatabaseClient, TupleRootTransactionApi, Unsubscribe } from "tuple-database";
import { FieldData, FullSchemaConfig, StoreConfig } from "@latticexyz/store";
import { AbiTypeToPrimitiveType } from "@latticexyz/schema-type";
import { StringForUnion } from "@latticexyz/common/type-utils";

type FieldTypeToPrimitiveType<T extends FieldData<string>> = AbiTypeToPrimitiveType<T> extends never
  ? T extends `${any}[${any}]` // FieldType might include Enums and Enum arrays, which are mapped to uint8/uint8[]
    ? number[] // Map enum arrays to `number[]`
    : number // Map enums to `number`
  : AbiTypeToPrimitiveType<T>;

export type SchemaToPrimitives<T extends FullSchemaConfig> = { [key in keyof T]: FieldTypeToPrimitiveType<T[key]> };

export type Tables<C extends StoreConfig> = {
  [key in keyof C["tables"]]: {
    keyTuple: SchemaToPrimitives<C["tables"][key]["primaryKeys"]>;
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
        // Omitting the table config option because the table is prefilled when calling subscribe via the client
        filter?: Omit<SubscriptionFilterOptions<C, Table>, "table">
      ) => Unsubscribe;
    };
  };
} & {
  /** Utils to set a custom table value */
  set: <Table extends string>(
    table: Table,
    key: Key<C, Table>,
    value: Partial<Value<C, Table>>,
    options?: SetOptions
  ) => TupleRootTransactionApi;
  get: <Table extends string = string>(table: Table, key: Key<C, Table>) => Value<C, Table>;
  remove: <Table extends string = string>(
    table: Table,
    key: Key<C, Table>,
    options?: RemoveOptions
  ) => TupleRootTransactionApi;
  subscribe: <Table extends string = string>(
    callback: SubscriptionCallback<C, Table>,
    // Omitting the table config option because the table is prefilled when calling subscribe via the client
    filter: SubscriptionFilterOptions<C, Table>
  ) => Unsubscribe;
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
> = (updates: Record<T, Update<C, T>>) => void;

export type SubscriptionFilterOptions<
  C extends StoreConfig = StoreConfig,
  T extends keyof C["tables"] = keyof C["tables"]
> = {
  table: T & string;
  key?: { [key in "gt" | "gte" | "lt" | "lte" | "eq"]?: Partial<Key<C, T>> };
};

// TODO: figure out how to turn this into a proper typed union (where typescript can infer the type of set/remove from the type of table)
export type Update<C extends StoreConfig = StoreConfig, Table extends keyof C["tables"] = keyof C["tables"]> = {
  table: Table;
  set: KeyValue<C, Table>[];
  remove: { key: Key<C, Table> }[];
};
