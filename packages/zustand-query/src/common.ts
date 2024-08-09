import { Hex } from "viem";
import { QueryFragment } from "./queryFragments";
import { Table } from "@latticexyz/config";

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
export type TableRecord = {
  readonly [field: string]:
    | number
    | string
    | bigint
    | boolean
    | Hex
    | readonly number[]
    | readonly Hex[]
    | readonly bigint[]
    | readonly boolean[];
};

export type TableUpdate = { prev: TableRecord | undefined; current: TableRecord | undefined };

export type TableUpdates = { [key: string]: TableUpdate };

export type TableLabel = { label: string; namespace?: string };

export type TableRecords = { readonly [key: string]: TableRecord };

export type MutableTableRecords = { [key: string]: TableRecord };

export type StoreRecords = {
  readonly [namespace: string]: {
    readonly [table: string]: TableRecords;
  };
};

export type MutableStoreRecords = {
  [namespace: string]: {
    [table: string]: MutableTableRecords;
  };
};

export type State = {
  readonly config: {
    readonly [namespace: string]: {
      readonly [tableConfig: string]: Table;
    };
  };
  readonly records: StoreRecords;
};

export type MutableState = {
  config: {
    [namespace: string]: {
      [tableConfig: string]: Table;
    };
  };
  records: MutableStoreRecords;
};

export type TableUpdatesSubscriber = (updates: TableUpdates) => void;

export type TableSubscribers = {
  [namespace: string]: {
    [table: string]: Set<TableUpdatesSubscriber>;
  };
};

export type Store = {
  /**
   * Get a readonly reference to the current state
   */
  get: () => State;
  /**
   * Internal references for interacting with the state.
   * @internal
   * @deprecated Do not use this internal reference externally.
   */
  _: {
    tableSubscribers: TableSubscribers;
    state: MutableState;
  };
};

export function withDefaultNamespace({ namespace, label }: TableLabel): Required<TableLabel> {
  return {
    namespace: namespace ?? "",
    label,
  };
}
