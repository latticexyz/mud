import { Table } from "@latticexyz/config";
import { Store, TableUpdatesSubscriber, Unsubscribe } from "../common";

export type SubscribeTableArgs<table extends Table = Table> = {
  store: Store;
  table: table;
  subscriber: TableUpdatesSubscriber<table>;
};

export type SubscribeTableResult = Unsubscribe;

export function subscribeTable<table extends Table>({
  store,
  table,
  subscriber,
}: SubscribeTableArgs<table>): SubscribeTableResult {
  const { namespace, label } = table;

  store._.tableSubscribers[namespace][label].add(subscriber);
  return () => store._.tableSubscribers[namespace][label].delete(subscriber);
}
