import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { useAccountRequirements } from "./useAccountRequirements";

const store = createStore(() => ({ open: false }));

export type UseAccountModalResult = {
  readonly accountModalOpen: boolean;
  readonly openAccountModal: () => void;
  readonly closeAccountModal: () => void;
  readonly toggleAccountModal: (open: boolean) => void;
};

export function useAccountModal(): UseAccountModalResult {
  const { requirements } = useAccountRequirements();
  const hasRequirements = requirements.length > 0;
  const accountModalOpen = useStore(store, (state) => state.open) && hasRequirements;

  const openAccountModal = useCallback(() => {
    store.setState({ open: hasRequirements });
  }, [hasRequirements]);

  const closeAccountModal = useCallback(() => {
    store.setState({ open: false });
  }, []);

  const toggleAccountModal = useCallback(
    (open: boolean) => {
      store.setState({ open: open && hasRequirements });
    },
    [hasRequirements],
  );

  return useMemo(
    () => ({
      accountModalOpen,
      openAccountModal,
      closeAccountModal,
      toggleAccountModal,
    }),
    [accountModalOpen, openAccountModal, closeAccountModal, toggleAccountModal],
  );
}
