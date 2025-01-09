import { Table } from "@latticexyz/config";
import { Stash, TableUpdatesSubscriber, Unsubscribe } from "../common";
import { registerTable } from "./registerTable";

export type SubscribeTableArgs<table extends Table = Table> = {
  stash: Stash;
  table: table;
  subscriber: TableUpdatesSubscriber<table>;
};

export type SubscribeTableResult = Unsubscribe;

export function subscribeTable<table extends Table>({
  stash,
  table,
  subscriber,
}: SubscribeTableArgs<table>): SubscribeTableResult {
  const { namespaceLabel, label } = table;

  if (stash.get().config[namespaceLabel]?.[label] == null) {
    registerTable({ stash, table });
  }

  stash._.tableSubscribers[namespaceLabel]?.[label]?.add(subscriber as TableUpdatesSubscriber);
  return () => stash._.tableSubscribers[namespaceLabel]?.[label]?.delete(subscriber as TableUpdatesSubscriber);
}
