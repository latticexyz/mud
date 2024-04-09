import { useMemo } from "react";
import { assertExhaustive } from "@latticexyz/common/utils";
import { AppSignerDialogContent } from "./AppSignerDialogContent";
import { GasAllowanceDialogContent } from "./GasAllowanceDialogContent";
import { AccountDelegationDialogContent } from "./AccountDelegationDialogContent";
import { LoginRequirement } from "./common";
import { GasSpenderDialogContent } from "./GasSpenderDialogContent";
import { ConnectedChainDialogContent } from "./ConnectedChainDialogContent";
import { Modal, Props as ModalProps } from "./ui/Modal";

export type Props = Pick<ModalProps, "open" | "onOpenChange" | "trigger"> & {
  requirement: LoginRequirement;
};

export function LoginDialog({ requirement, ...dialogProps }: Props) {
  const content = useMemo(() => {
    switch (requirement) {
      case "connectedWallet":
        // TODO
        return <>Connect wallet</>;
      case "connectedChain":
        return <ConnectedChainDialogContent />;
      case "appSigner":
        return <AppSignerDialogContent />;
      case "gasAllowance":
        return <GasAllowanceDialogContent />;
      case "gasSpender":
        return <GasSpenderDialogContent />;
      case "accountDelegation":
        return <AccountDelegationDialogContent />;
      default:
        return assertExhaustive(requirement);
    }
  }, [requirement]);

  return <Modal {...dialogProps}>{content}</Modal>;
}
