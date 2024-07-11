import { useAccountModal } from "../core/useAccountModal";
import { usePreparedAppAccountClient } from "../core/usePreparedAppAccountClient";
import { useEffect } from "react";
import { useAccount, useConnectorClient } from "wagmi";
import { ExternalStore } from "./createExternalStore";

export type Props = {
  externalStore: ExternalStore;
};

export function SyncStore({ externalStore }: Props) {
  const { accountModalOpen, openAccountModal, closeAccountModal, toggleAccountModal } = useAccountModal();
  const appAccountClient = usePreparedAppAccountClient();
  const { data: userAccountClient } = useConnectorClient();
  const { address: userAddress, chainId: userChainId } = useAccount();

  useEffect(() => {
    externalStore.setState({
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
    externalStore,
    accountModalOpen,
    appAccountClient,
    closeAccountModal,
    openAccountModal,
    toggleAccountModal,
    userAccountClient,
    userAddress,
    userChainId,
  ]);

  return null;
}
