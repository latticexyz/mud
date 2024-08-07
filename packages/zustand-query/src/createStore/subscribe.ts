import { TableLabel, Unsubscribe } from "../common";
import { Context, TableUpdatesSubscriber } from "./common";

export type SubscribeArgs = {
  table: TableLabel;
  subscriber: TableUpdatesSubscriber;
};

export type SubscribeResult = Unsubscribe;

export const subscribe =
  (context: Context): ((args: SubscribeArgs) => SubscribeResult) =>
  ({ table, subscriber }) => {
    const { subscribers } = context;
    const namespace = table.namespace ?? "";
    const label = table.label;

    subscribers[namespace][label].add(subscriber);
    return () => subscribers[namespace][label].delete(subscriber);
  };
