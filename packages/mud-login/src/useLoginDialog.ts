import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

const store = createStore(() => ({ open: false }));

export type UseLoginDialogResult = {
  readonly openConnectModal: (() => void) | undefined;
  readonly connectPending: boolean;
  readonly loginDialogOpen: boolean;
  readonly openLoginDialog: () => void;
  readonly closeLoginDialog: () => void;
  readonly toggleLoginDialog: (open: boolean) => void;
};

export function useLoginDialog(): UseLoginDialogResult {
  const { openConnectModal, connectModalOpen } = useConnectModal();
  const connectPending = !openConnectModal || connectModalOpen;

  const loginDialogOpen = useStore(store, (state) => state.open);

  const openLoginDialog = useCallback(() => {
    store.setState({ open: true });
  }, []);

  const closeLoginDialog = useCallback(() => {
    store.setState({ open: false });
  }, []);

  const toggleLoginDialog = useCallback((open: boolean) => {
    store.setState({ open });
  }, []);

  return useMemo(
    () => ({
      openConnectModal,
      connectPending,
      loginDialogOpen,
      openLoginDialog,
      closeLoginDialog,
      toggleLoginDialog,
    }),
    [closeLoginDialog, connectPending, loginDialogOpen, openConnectModal, openLoginDialog, toggleLoginDialog],
  );
}
