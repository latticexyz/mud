import { useStore } from "zustand";
import { useAccountKitInstance } from "./AccountKitProvider";
import { ExternalState } from "../global/createExternalStore";

export function useAccountModal(): Pick<
  ExternalState,
  "accountModalOpen" | "openAccountModal" | "closeAccountModal" | "toggleAccountModal"
> {
  const accountKit = useAccountKitInstance();
  const accountModalOpen = useStore(accountKit.store, (state) => state.accountModalOpen);
  const openAccountModal = useStore(accountKit.store, (state) => state.openAccountModal);
  const closeAccountModal = useStore(accountKit.store, (state) => state.closeAccountModal);
  const toggleAccountModal = useStore(accountKit.store, (state) => state.toggleAccountModal);
  return { accountModalOpen, openAccountModal, closeAccountModal, toggleAccountModal };
}
