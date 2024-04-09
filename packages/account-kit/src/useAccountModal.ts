import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

const store = createStore(() => ({ open: false }));

export type UseAccountModalResult = {
  readonly openConnectModal: (() => void) | undefined;
  readonly connectPending: boolean;
  readonly accountModalOpen: boolean;
  readonly openAccountModal: () => void;
  readonly closeAccountModal: () => void;
  readonly toggleAccountModal: (open: boolean) => void;
};

export function useAccountModal(): UseAccountModalResult {
  const { openConnectModal, connectModalOpen } = useConnectModal();
  const connectPending = !openConnectModal || connectModalOpen;

  const accountModalOpen = useStore(store, (state) => state.open);

  const openAccountModal = useCallback(() => {
    store.setState({ open: true });
  }, []);

  const closeAccountModal = useCallback(() => {
    store.setState({ open: false });
  }, []);

  const toggleAccountModal = useCallback((open: boolean) => {
    store.setState({ open });
  }, []);

  return useMemo(
    () => ({
      openConnectModal,
      connectPending,
      accountModalOpen,
      openAccountModal,
      closeAccountModal,
      toggleAccountModal,
    }),
    [closeAccountModal, connectPending, accountModalOpen, openConnectModal, openAccountModal, toggleAccountModal],
  );
}
