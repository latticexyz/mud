import { useMemo } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

const store = createStore(() => ({ open: false }));

// TODO: decide if we wanna export these rather than returning in hook
//       downside of exposing is that if we ever wanna change behavior to be based on anything in react state tree, we can't

function openAccountModal() {
  store.setState({ open: true });
}
function closeAccountModal() {
  store.setState({ open: false });
}
function toggleAccountModal(open: boolean) {
  store.setState({ open });
}

export type UseAccountModalResult = {
  readonly accountModalOpen: boolean;
  readonly openAccountModal: () => void;
  readonly closeAccountModal: () => void;
  readonly toggleAccountModal: (open: boolean) => void;
};

export function useAccountModal(): UseAccountModalResult {
  const accountModalOpen = useStore(store, (state) => state.open);

  return useMemo(
    () => ({
      accountModalOpen,
      openAccountModal,
      closeAccountModal,
      toggleAccountModal,
    }),
    [accountModalOpen],
  );
}
