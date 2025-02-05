import { findCause } from "@latticexyz/common";
import { createStore } from "zustand/vanilla";

export const store = createStore<{
  readonly lastId: number;
  readonly errors: readonly {
    readonly id: number;
    readonly error: Error;
    readonly dismiss?: () => unknown;
    readonly retry?: () => unknown | Promise<unknown>;
  }[];
}>(() => ({
  lastId: 0,
  errors: [],
}));

export function addError({
  error,
  retry,
  dismiss,
}: {
  error: Error;
  retry?: () => unknown | Promise<unknown>;
  dismiss?: () => unknown;
}) {
  // no need to let users know they rejected
  if (findCause(error, ({ name }) => name === "UserRejectedRequestError")) {
    return;
  }

  store.setState((state) => {
    if (state.errors.some((e) => e.error === error)) {
      return {};
    }

    const id = state.lastId + 1;
    return {
      lastId: id,
      errors: [
        ...state.errors,
        {
          id,
          error,
          dismiss: dismiss
            ? () => {
                removeError(error);
                dismiss();
              }
            : undefined,
          retry: retry
            ? async () => {
                removeError(error);
                await retry();
              }
            : undefined,
        },
      ],
    };
  });

  return () => {
    removeError(error);
  };
}

export function removeError(error: Error) {
  store.setState((state) => ({
    errors: state.errors.filter((e) => e.error !== error),
  }));
}
