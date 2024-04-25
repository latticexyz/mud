import { useCallback, useEffect, useMemo } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { usePrevious } from "./utils/usePrevious";
import { useOnboardingSteps } from "./useOnboardingSteps";

const store = createStore(() => ({ open: false }));

export type UseAccountModalResult = {
  readonly accountModalOpen: boolean;
  readonly openAccountModal: () => void;
  readonly closeAccountModal: () => void;
  readonly toggleAccountModal: (open: boolean) => void;
};

export function useAccountModal(): UseAccountModalResult {
  const accountModalOpen = useStore(store, (state) => state.open);

  const openAccountModal = useCallback(() => {
    store.setState({ open: true });
  }, []);

  const closeAccountModal = useCallback(() => {
    store.setState({ open: false });
  }, []);

  const toggleAccountModal = useCallback((open: boolean) => {
    store.setState({ open: open });
  }, []);

  // Close account modal once we've completed all the steps
  const { step } = useOnboardingSteps();
  const previousStep = usePrevious(step);
  useEffect(() => {
    if (previousStep && !step) {
      closeAccountModal();
    }
  }, [closeAccountModal, previousStep, step]);

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
