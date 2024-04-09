import { useMemo } from "react";
import { assertExhaustive } from "@latticexyz/common/utils";
import { AppSignerContent } from "./steps/set-up/AppSignerContent";
import { GasAllowanceContent } from "./steps/gas-tank/GasAllowanceContent";
import { AccountDelegationContent } from "./steps/sign-in/AccountDelegationContent";
import { GasSpenderContent } from "./steps/gas-tank/GasSpenderContent";
import { ConnectWalletContent } from "./steps/connect/ConnectWalletContent";
import { Modal, Props as ModalProps } from "./ui/Modal";
import { AccountRequirement } from "./useAccountRequirements";

export type Props = Pick<ModalProps, "open" | "onOpenChange" | "trigger"> & {
  requirement: AccountRequirement;
};

export function AccountModal({ requirement, ...dialogProps }: Props) {
  const content = useMemo(() => {
    switch (requirement) {
      case "connectedWallet":
      case "connectedChain":
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

  return <Modal {...dialogProps}>{content}</Modal>;
}
