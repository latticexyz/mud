import { Store, StoreUpdatesSubscriber, Unsubscribe } from "../common";

export type SubscribeStoreArgs = {
  store: Store;
  subscriber: StoreUpdatesSubscriber;
};

export type SubscribeStoreResult = Unsubscribe;

export function subscribeStore({ store, subscriber }: SubscribeStoreArgs): SubscribeStoreResult {
  store._.storeSubscribers.add(subscriber);
  return () => store._.storeSubscribers.delete(subscriber);
}
