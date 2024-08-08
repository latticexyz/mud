import { Store, TableLabel, TableUpdatesSubscriber, Unsubscribe, withDefaultNamespace } from "../common";

export type SubscribeArgs = {
  store: Store;
  table: TableLabel;
  subscriber: TableUpdatesSubscriber;
};

export type SubscribeResult = Unsubscribe;

export function subscribe({ store, table, subscriber }: SubscribeArgs): SubscribeResult {
  const { namespace, label } = withDefaultNamespace(table);

  store._.subscribers[namespace][label].add(subscriber);
  return () => store._.subscribers[namespace][label].delete(subscriber);
}
