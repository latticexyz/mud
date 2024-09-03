import { Stash, StoreConfig, StoreUpdatesSubscriber, Unsubscribe } from "../common";

export type SubscribeStoreArgs<config extends StoreConfig = StoreConfig> = {
  stash: Stash<config>;
  subscriber: StoreUpdatesSubscriber<config>;
};

export type SubscribeStoreResult = Unsubscribe;

export function subscribeStore<config extends StoreConfig>({
  stash,
  subscriber,
}: SubscribeStoreArgs<config>): SubscribeStoreResult {
  stash._.storeSubscribers.add(subscriber as StoreUpdatesSubscriber);
  return () => stash._.storeSubscribers.delete(subscriber as StoreUpdatesSubscriber);
}
