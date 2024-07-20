import { QueryFragment } from "./queryFragments";

/**
 * A Key is the unique identifier for a row in the table.
 */
export type Key = { [field: string]: number | string | bigint };

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
export type TableRecord = { readonly [field: string]: number | string | bigint | number[] | string[] | bigint[] };

export type TableUpdate = { prev: TableRecord | undefined; current: TableRecord | undefined };

export type TableUpdates = { [key: string]: TableUpdate };

export type TableLabel = { label: string; namespace?: string };

export type TableRecords = { readonly [key: string]: TableRecord };

export type StoreRecords = {
  [namespace: string]: {
    [table: string]: TableRecords;
  };
};
