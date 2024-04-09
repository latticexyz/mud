import { useMemo } from "react";
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

export type Props = Pick<ModalProps, "open" | "onOpenChange"> & {
  requirement?: AccountRequirement;
};

export function AccountModal({ requirement, ...modalProps }: Props) {
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
    <Modal {...modalProps}>
      <DialogContent className="flex w-[36rem] min-h-[24rem] bg-neutral-800 text-neutral-400 border border-white/20 outline-none">
        <div className="w-[12rem] bg-neutral-900">
          <AccountModalSidebar activeStep={activeStep} />
        </div>
        <div className="flex-grow flex">{content}</div>
      </DialogContent>
    </Modal>
  );
}
