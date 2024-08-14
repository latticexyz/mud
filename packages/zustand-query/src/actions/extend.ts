import { Store } from "../common";

export type ExtendArgs<store extends Store, actions> = {
  store: store;
  actions: actions;
};

export type ExtendResult<store extends Store, actions> = store & actions;

export function extend<store extends Store, actions>({
  store,
  actions,
}: ExtendArgs<store, actions>): ExtendResult<store, actions> {
  return { ...store, ...actions };
}
