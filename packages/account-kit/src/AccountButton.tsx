import { Button } from "./ui/Button";
import { useAccountModal } from "./useAccountModal";
import { AccountModal } from "./AccountModal";
import { useAccountRequirements } from "./useAccountRequirements";
import { Shadow } from "./Shadow";

const buttonClassName = "w-48";

export function AccountButton() {
  const { requirement } = useAccountRequirements();
  const { openConnectModal, connectPending, openAccountModal, toggleAccountModal, accountModalOpen } =
    useAccountModal();

  if (requirement === "connectedWallet") {
    return (
      <Shadow>
        <Button
          className={buttonClassName}
          pending={connectPending}
          onClick={() => {
            openConnectModal?.();
            openAccountModal();
          }}
        >
          Connect wallet
        </Button>
      </Shadow>
    );
  }

  if (requirement != null) {
    return (
      <>
        <Shadow>
          <Button className={buttonClassName} onClick={openAccountModal}>
            Sign in
          </Button>
        </Shadow>
        <AccountModal requirement={requirement} open={accountModalOpen} onOpenChange={toggleAccountModal} />
      </>
    );
  }

  // TODO
  return (
    <Shadow>
      <Button className={buttonClassName} disabled>
        All good!
      </Button>
    </Shadow>
  );
}
