import { Store as StoreConfig } from "@latticexyz/store";
import { Store, StoreUpdatesSubscriber, Unsubscribe } from "../common";

export type SubscribeStoreArgs<config extends StoreConfig = StoreConfig> = {
  store: Store<config>;
  subscriber: StoreUpdatesSubscriber<config>;
};

export type SubscribeStoreResult = Unsubscribe;

export function subscribeStore<config extends StoreConfig>({
  store,
  subscriber,
}: SubscribeStoreArgs<config>): SubscribeStoreResult {
  store._.storeSubscribers.add(subscriber);
  return () => store._.storeSubscribers.delete(subscriber);
}
