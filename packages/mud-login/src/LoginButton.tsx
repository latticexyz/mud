import { Button } from "./ui/Button";
import { useLoginDialog } from "./useLoginDialog";
import { LoginDialog } from "./LoginDialog";
import { useLoginRequirements } from "./useLoginRequirements";
import { Shadow } from "./Shadow";

export function LoginButton() {
  const { requirement } = useLoginRequirements();
  const { openConnectModal, openLoginDialog, toggleLoginDialog, loginDialogOpen } = useLoginDialog();

  if (requirement === "connectedWallet") {
    return (
      <Shadow>
        <Button onClick={openConnectModal} pending={!openConnectModal}>
          Connect wallet
        </Button>
      </Shadow>
    );
  }

  if (requirement != null) {
    return (
      <>
        <Shadow>
          <Button onClick={openLoginDialog}>Log in</Button>
        </Shadow>
        <LoginDialog requirement={requirement} open={loginDialogOpen} onOpenChange={toggleLoginDialog} />
      </>
    );
  }

  // TODO
  return (
    <Shadow>
      <Button disabled>All good!</Button>
    </Shadow>
  );
}
