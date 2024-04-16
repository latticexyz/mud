import { useAccountModal } from "../useAccountModal";
import { useAppAccountClient } from "../useAppAccountClient";
import { useEffect } from "react";
import { Store } from "./store";

export type Props = {
  store: Store;
};

export function SyncStore({ store }: Props) {
  const { accountModalOpen, openAccountModal, closeAccountModal, toggleAccountModal } = useAccountModal();
  const appAccountClient = useAppAccountClient();

  useEffect(() => {
    store.setState({
      accountModalOpen,
      openAccountModal,
      closeAccountModal,
      toggleAccountModal,
      appAccountClient,
    });
  }, [store, accountModalOpen, appAccountClient, closeAccountModal, openAccountModal, toggleAccountModal]);

  return <></>;
}
