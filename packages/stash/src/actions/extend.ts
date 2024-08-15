import { Stash } from "../common";

export type ExtendArgs<stash extends Stash, actions> = {
  stash: stash;
  actions: actions;
};

export type ExtendResult<stash extends Stash, actions> = stash & actions;

export function extend<stash extends Stash, actions>({
  stash,
  actions,
}: ExtendArgs<stash, actions>): ExtendResult<stash, actions> {
  return { ...stash, ...actions };
}
