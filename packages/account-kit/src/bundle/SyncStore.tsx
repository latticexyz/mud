import { useAccountModal } from "../useAccountModal";
import { usePreparedAppAccountClient } from "../usePreparedAppAccountClient";
import { useEffect } from "react";
import { Store } from "./store";

export type Props = {
  store: Store;
};

export function SyncStore({ store }: Props) {
  const { accountModalOpen, openAccountModal, closeAccountModal, toggleAccountModal } = useAccountModal();
  const appAccountClient = usePreparedAppAccountClient();

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
