import { Button } from "./ui/Button";
import { useLoginDialog } from "./useLoginDialog";
import { LoginDialog } from "./LoginDialog";
import { useLoginRequirements } from "./useLoginRequirements";

export function LoginButton() {
  const { requirement } = useLoginRequirements();
  const { openConnectModal, openLoginDialog, toggleLoginDialog, loginDialogOpen } = useLoginDialog();

  if (requirement === "connectedWallet") {
    return (
      <div id="mud-login">
        <Button onClick={openConnectModal} pending={!openConnectModal}>
          Connect wallet
        </Button>
      </div>
    );
  }

  if (requirement != null) {
    return (
      <div id="mud-login">
        <Button onClick={openLoginDialog}>Log in</Button>
        <LoginDialog requirement={requirement} open={loginDialogOpen} onOpenChange={toggleLoginDialog} />
      </div>
    );
  }

  // TODO
  return (
    <div id="mud-login">
      <Button disabled>All good!</Button>
    </div>
  );
}
