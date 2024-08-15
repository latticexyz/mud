import { Store } from "../common";

export type ExtendArgs<stash extends Store, actions> = {
  stash: stash;
  actions: actions;
};

export type ExtendResult<stash extends Store, actions> = stash & actions;

export function extend<stash extends Store, actions>({
  stash,
  actions,
}: ExtendArgs<stash, actions>): ExtendResult<stash, actions> {
  return { ...stash, ...actions };
}
