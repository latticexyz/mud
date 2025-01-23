import { useAccountModal } from "../useAccountModal";
import { useEffect } from "react";
import { Store } from "./store";
import { useSessionClientReady } from "../useSessionClientReady";

export type Props = {
  store: Store;
};

export function SyncStore({ store }: Props) {
  // TODO: combine store from useAccountModal rather than syncing via component/hook lifecycle
  const { accountModalOpen, openAccountModal, closeAccountModal, toggleAccountModal } = useAccountModal();
  const sessionClient = useSessionClientReady();

  useEffect(() => {
    store.setState({
      accountModalOpen,
      openAccountModal,
      closeAccountModal,
      toggleAccountModal,
      // TODO: expose the whole UseQueryResult object?
      sessionClient: sessionClient.data,
    });
  }, [store, accountModalOpen, closeAccountModal, openAccountModal, toggleAccountModal, sessionClient.data]);

  return <></>;
}
