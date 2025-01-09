import { Stash, StoreConfig, StoreUpdatesSubscriber, Unsubscribe } from "../common";

export type SubscribeStashArgs<config extends StoreConfig = StoreConfig> = {
  stash: Stash<config>;
  subscriber: StoreUpdatesSubscriber<config>;
};

export type SubscribeStashResult = Unsubscribe;

export function subscribeStash<config extends StoreConfig>({
  stash,
  subscriber,
}: SubscribeStashArgs<config>): SubscribeStashResult {
  stash._.storeSubscribers.add(subscriber as StoreUpdatesSubscriber);
  return () => stash._.storeSubscribers.delete(subscriber as StoreUpdatesSubscriber);
}
