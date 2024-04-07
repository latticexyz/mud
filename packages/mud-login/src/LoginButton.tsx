import { Button } from "@radix-ui/themes";
import { useLoginDialog } from "./useLoginDialog";
import { LoginDialog } from "./LoginDialog";
import { useLoginRequirements } from "./useLoginRequirements";

export function LoginButton() {
  const { requirement } = useLoginRequirements();
  const { openConnectModal, openLoginDialog, toggleLoginDialog, loginDialogOpen } = useLoginDialog();

  if (requirement === "connectedWallet") {
    return (
      <Button onClick={openConnectModal} loading={!openConnectModal}>
        Connect wallet
      </Button>
    );
  }

  if (requirement != null) {
    return (
      <>
        <Button onClick={openLoginDialog}>Log in</Button>
        <LoginDialog requirement={requirement} open={loginDialogOpen} onOpenChange={toggleLoginDialog} />
      </>
    );
  }

  // TODO
  return <Button disabled>All good!</Button>;
}
