import { useAccountModal } from "../useAccountModal";
import { usePreparedAppAccountClient } from "../usePreparedAppAccountClient";
import { useEffect } from "react";
import { Store } from "./store";
import { useAccount, useConnectorClient } from "wagmi";

export type Props = {
  store: Store;
};

export function SyncStore({ store }: Props) {
  const { accountModalOpen, openAccountModal, closeAccountModal, toggleAccountModal } = useAccountModal();
  const appAccountClient = usePreparedAppAccountClient();
  const { data: userAccountClient } = useConnectorClient();
  const { address: userAddress, chainId: userChainId } = useAccount();

  useEffect(() => {
    store.setState({
      accountModalOpen,
      openAccountModal,
      closeAccountModal,
      toggleAccountModal,
      appAccountClient,
      userAccountClient,
      userAddress,
      userChainId,
    });
  }, [
    store,
    accountModalOpen,
    appAccountClient,
    closeAccountModal,
    openAccountModal,
    toggleAccountModal,
    userAccountClient,
    userAddress,
    userChainId,
  ]);

  return <></>;
}
