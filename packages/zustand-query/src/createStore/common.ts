import { Table } from "@latticexyz/config";
import { StoreRecords, TableUpdates } from "../common";
import { Draft } from "mutative";

export type State = {
  config: {
    [namespace: string]: {
      [tableConfig: string]: Table;
    };
  };
  records: StoreRecords;
};

export type TableUpdatesSubscriber = (updates: TableUpdates) => void;

export type Subscribers = {
  [namespace: string]: {
    [table: string]: Set<TableUpdatesSubscriber>;
  };
};

export type Context = {
  get: () => State;
  set: (nextStateOrUpdater: State | Partial<State> | ((state: Draft<State>) => void)) => void;
  subscribers: Subscribers;
};
