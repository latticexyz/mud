import { Store, TableLabel, TableUpdatesSubscriber, Unsubscribe, withDefaultNamespace } from "../common";

export type SubscribeTableArgs = {
  store: Store;
  table: TableLabel;
  subscriber: TableUpdatesSubscriber;
};

export type SubscribeTableResult = Unsubscribe;

export function subscribeTable({ store, table, subscriber }: SubscribeTableArgs): SubscribeTableResult {
  const { namespace, label } = withDefaultNamespace(table);

  store._.tableSubscribers[namespace][label].add(subscriber);
  return () => store._.tableSubscribers[namespace][label].delete(subscriber);
}
