import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

const store = createStore(() => ({ open: false }));

export type UseLoginDialogResult = {
  // TODO: figure out how to get this to be not undefined?
  readonly openConnectModal: (() => void) | undefined;
  readonly loginDialogOpen: boolean;
  readonly openLoginDialog: () => void;
  readonly closeLoginDialog: () => void;
  readonly toggleLoginDialog: (open: boolean) => void;
};

export function useLoginDialog(): UseLoginDialogResult {
  const { openConnectModal } = useConnectModal();
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
      loginDialogOpen,
      openLoginDialog,
      closeLoginDialog,
      toggleLoginDialog,
    }),
    [closeLoginDialog, loginDialogOpen, openConnectModal, openLoginDialog, toggleLoginDialog],
  );
}
