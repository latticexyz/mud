import { useEffect } from "react";
import { Modal } from "./ui/Modal";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { usePrevious } from "./utils/usePrevious";
import { AccountModalContent } from "./AccountModalContent";
import { useAccountModal } from "./useAccountModal";

export function AccountModal() {
  const { status } = useAccount();
  const { accountModalOpen, toggleAccountModal } = useAccountModal();
  const { openConnectModal, connectModalOpen } = useConnectModal();
  const shown = accountModalOpen && status === "connected";

  const previousOpen = usePrevious(accountModalOpen);
  const previousConnectModalOpen = usePrevious(connectModalOpen);
  const previousStatus = usePrevious(status);

  // We are temporarily leaning on RainbowKit for connect wallet UI, but RainbowKit
  // doesn't give us much data, so we'll work around it here to reactively open/close
  // based on state transitions.
  // TODO: remove this once we can inline connect wallet UI into our own modal
  useEffect(() => {
    // account modal is open and account is not connected
    if (accountModalOpen && status !== "connected" && !connectModalOpen) {
      // opening account modal should open connect modal
      if (!previousOpen) {
        console.debug("opening connect modal");
        openConnectModal?.();
      }
      // disconnecting account should re-open connect modal
      else if (previousStatus === "connected") {
        console.debug("disconnected, reopening connect modal");
        openConnectModal?.();
      }
      // closing connect modal should close account modal
      else if (previousConnectModalOpen) {
        console.debug("connect modal closed, closing account modal");
        toggleAccountModal(false);
      }
    }
  }, [
    accountModalOpen,
    connectModalOpen,
    openConnectModal,
    previousConnectModalOpen,
    previousOpen,
    previousStatus,
    status,
    toggleAccountModal,
  ]);

  return (
    <Modal open={shown} onOpenChange={toggleAccountModal}>
      {shown ? <AccountModalContent /> : null}
    </Modal>
  );
}
