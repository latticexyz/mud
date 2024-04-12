import { useEffect, useMemo } from "react";
import { assertExhaustive } from "@latticexyz/common/utils";
import { AppSignerContent } from "./steps/set-up/AppSignerContent";
import { GasAllowanceContent } from "./steps/gas-tank/GasAllowanceContent";
import { AccountDelegationContent } from "./steps/sign-in/AccountDelegationContent";
import { GasSpenderContent } from "./steps/gas-tank/GasSpenderContent";
import { ConnectWalletContent } from "./steps/connect/ConnectWalletContent";
import { Modal, Props as ModalProps } from "./ui/Modal";
import { AccountRequirement } from "./useAccountRequirements";
import { DialogContent } from "@radix-ui/react-dialog";
import { AccountModalSidebar } from "./AccountModalSidebar";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { usePrevious } from "./utils/usePrevious";

export type Props = Pick<ModalProps, "open" | "onOpenChange"> & {
  requirement?: AccountRequirement;
};

export function AccountModal({ requirement, open, onOpenChange }: Props) {
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

  const activeStep = useMemo(() => {
    switch (requirement) {
      case "connectedWallet":
      case "connectedChain":
      case undefined:
        return "connect";
      case "appSigner":
        return "set-up";
      case "gasAllowance":
      case "gasSpender":
        return "gas-tank";
      case "accountDelegation":
        return "sign-in";
      default:
        return assertExhaustive(requirement);
    }
  }, [requirement]);

  const content = useMemo(() => {
    switch (requirement) {
      case "connectedWallet":
      case "connectedChain":
      case undefined:
        return <ConnectWalletContent />;
      case "appSigner":
        return <AppSignerContent />;
      case "gasAllowance":
        return <GasAllowanceContent />;
      case "gasSpender":
        return <GasSpenderContent />;
      case "accountDelegation":
        return <AccountDelegationContent />;
      default:
        return assertExhaustive(requirement);
    }
  }, [requirement]);

  return (
    <Modal open={shown} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-[48rem] min-h-[24rem] bg-neutral-800 text-neutral-400 border border-neutral-600 divide-x divide-neutral-600 outline-none">
        <div className="w-[16rem] bg-neutral-900">
          <AccountModalSidebar activeStep={activeStep} />
        </div>
        <div className="flex-grow flex">{content}</div>
      </DialogContent>
    </Modal>
  );
}
