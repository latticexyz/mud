import { useEffect } from "react";
import { Modal } from "./ui/Modal";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { usePrevious } from "./utils/usePrevious";
import { AccountModalContent } from "./AccountModalContent";
import { useAccountModal } from "./useAccountModal";
import { twMerge } from "tailwind-merge";
import { AccountModalSidebar } from "./AccountModalSidebar";
import { AccountModalErrorBoundary } from "./AccountModalErrorBoundary";

export function AccountModal() {
  const { status } = useAccount();
  console.log("status", status);
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
      {shown ? (
        <div
          className={twMerge(
            "flex w-[44rem] min-h-[28rem] border divide-x",
            "bg-neutral-100 text-neutral-700 border-neutral-300 divide-neutral-300",
            "dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:divide-neutral-700",
            "links:font-medium links:underline links:underline-offset-4",
            "links:text-black dark:links:text-white",
            "links:decoration-neutral-300 dark:links:decoration-neutral-500 hover:links:decoration-orange-500",
          )}
        >
          <div className="flex-shrink-0 w-[16rem] bg-neutral-200 dark:bg-neutral-900">
            <AccountModalSidebar />
          </div>
          <AccountModalErrorBoundary>
            <div className="flex-grow flex flex-col divide-y divide-neutral-300 dark:divide-neutral-700">
              <AccountModalContent />
            </div>
          </AccountModalErrorBoundary>
        </div>
      ) : null}
    </Modal>
  );
}
