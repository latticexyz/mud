import { useCallback, useEffect, useMemo } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { useAccountRequirements } from "./useAccountRequirements";
import { usePrevious } from "./utils/usePrevious";

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

  // Close account modal once we've completed all the requirements
  const previousHasRequirements = usePrevious(hasRequirements);
  useEffect(() => {
    if (previousHasRequirements && !hasRequirements) {
      closeAccountModal();
    }
  }, [closeAccountModal, hasRequirements, previousHasRequirements]);

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
