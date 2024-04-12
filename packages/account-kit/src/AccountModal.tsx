import { useEffect, useMemo } from "react";
import { assertExhaustive } from "@latticexyz/common/utils";
import { AppSignerContent } from "./steps/set-up/AppSignerContent";
import { GasAllowanceContent } from "./steps/gas-tank/GasAllowanceContent";
import { AccountDelegationContent } from "./steps/sign-in/AccountDelegationContent";
import { Modal, Props as ModalProps } from "./ui/Modal";
import { DialogContent } from "@radix-ui/react-dialog";
import { AccountModalSidebar } from "./AccountModalSidebar";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { usePrevious } from "./utils/usePrevious";
import { useOnboardingSteps } from "./useOnboardingSteps";
import { GasSpenderContent } from "./steps/gas-tank/GasSpenderContent";

export type Props = Pick<ModalProps, "open" | "onOpenChange">;

export function AccountModal({ open, onOpenChange }: Props) {
  const { status } = useAccount();
  const { openConnectModal, connectModalOpen } = useConnectModal();
  const shown = open && status === "connected";

  const previousOpen = usePrevious(open);
  const previousConnectModalOpen = usePrevious(connectModalOpen);
  const previousStatus = usePrevious(status);

  // We are temporarily leaning on RainbowKit for connect wallet UI, but RainbowKit
  // doesn't give us much data, so we'll work around it here to reactively open/close
  // based on state transitions.
  // TODO: remove this once we can inline connect wallet UI into our own modal
  useEffect(() => {
    // account modal is open and account is not connected
    if (open && status !== "connected" && !connectModalOpen) {
      // opening account modal should open connect modal
      if (!previousOpen) {
        openConnectModal?.();
      }
      // disconnecting account should re-open connect modal
      else if (previousStatus === "connected") {
        openConnectModal?.();
      }
      // closing connect modal should close account modal
      else if (previousConnectModalOpen) {
        onOpenChange?.(false);
      }
    }
  }, [
    connectModalOpen,
    onOpenChange,
    open,
    openConnectModal,
    previousConnectModalOpen,
    previousOpen,
    previousStatus,
    status,
  ]);

  // TODO: each step should have an `onComplete` that we can use to auto-advance if you've selected a step already
  const { step } = useOnboardingSteps();
  const content = useMemo(() => {
    switch (step) {
      case "app-signer":
        return <AppSignerContent />;
      case "gas-tank":
        // TODO: combine this better
        return (
          <>
            <GasAllowanceContent />
            <GasSpenderContent />
          </>
        );
      case "account-delegation":
        return <AccountDelegationContent />;
      default:
        return assertExhaustive(step);
    }
  }, [step]);

  return (
    <Modal open={shown} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-[48rem] min-h-[24rem] bg-neutral-800 text-neutral-400 border border-neutral-600 divide-x divide-neutral-600 outline-none">
        <div className="flex-shrink-0 w-[16rem] bg-neutral-900">
          <AccountModalSidebar />
        </div>
        <div className="flex-grow flex-col">{content}</div>
      </DialogContent>
    </Modal>
  );
}
