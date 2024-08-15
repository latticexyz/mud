import { Table } from "@latticexyz/config";
import { Stash, TableUpdatesSubscriber, Unsubscribe } from "../common";

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

  stash._.tableSubscribers[namespaceLabel][label].add(subscriber);
  return () => stash._.tableSubscribers[namespaceLabel][label].delete(subscriber);
}
