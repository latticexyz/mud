import { Button } from "./ui/Button";
import { useLoginDialog } from "./useLoginDialog";
import { LoginDialog } from "./LoginDialog";
import { useLoginRequirements } from "./useLoginRequirements";
import { Shadow } from "./Shadow";

export function LoginButton() {
  const { requirement } = useLoginRequirements();
  const { openConnectModal, connectPending, openLoginDialog, toggleLoginDialog, loginDialogOpen } = useLoginDialog();

  if (requirement === "connectedWallet") {
    return (
      <Shadow>
        <Button onClick={openConnectModal} pending={connectPending}>
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
