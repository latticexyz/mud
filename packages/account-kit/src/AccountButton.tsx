import { Button } from "./ui/Button";
import { useAccountModal } from "./useAccountModal";
import { AccountModal } from "./AccountModal";
import { useAccountRequirements } from "./useAccountRequirements";
import { Shadow } from "./ui/Shadow";
import { Logo } from "./icons/Logo";
import { useAccount } from "wagmi";
import { TruncatedHex } from "./ui/TruncateHex";
import { useChainModal, useConnectModal, useAccountModal as useWalletModal } from "@rainbow-me/rainbowkit";
import { useConnect } from "./useConnect";

// TODO: move this away from UI button so we have better control over how it's styled (since we'll deviate a fair bit from it)

const buttonClassName = "w-48 p-3 leading-none";

export function AccountButton() {
  const { requirement } = useAccountRequirements();
  const { openAccountModal, toggleAccountModal, accountModalOpen } = useAccountModal();
  const { address } = useAccount();

  const { mutateAsync: connect, isPending: connectIsPending } = useConnect();
  const { connectModalOpen } = useConnectModal();
  const { chainModalOpen } = useChainModal();
  const { accountModalOpen: walletModalOpen } = useWalletModal();
  const accountModalHidden = connectModalOpen || chainModalOpen || walletModalOpen;

  if (requirement === "connectedWallet") {
    return (
      <>
        <Shadow>
          <Button
            className={buttonClassName}
            pending={connectIsPending}
            onClick={() => {
              connect().then(
                () => openAccountModal(),
                (error) => console.log(error.message),
              );
            }}
          >
            <span className="inline-flex gap-2.5 items-center">
              <Logo />
              Sign in
            </span>
          </Button>
        </Shadow>
        <AccountModal requirement={requirement} open={accountModalOpen} onOpenChange={toggleAccountModal} />
      </>
    );
  }

  if (requirement != null) {
    return (
      <>
        <Shadow>
          <Button className={buttonClassName} pending={accountModalOpen} onClick={openAccountModal}>
            <span className="inline-flex gap-2.5 items-center">
              <Logo />
              Sign in
            </span>
          </Button>
        </Shadow>
        <AccountModal
          requirement={requirement}
          open={accountModalOpen && !accountModalHidden}
          onOpenChange={toggleAccountModal}
        />
      </>
    );
  }

  // TODO
  return (
    <>
      <Shadow>
        <Button variant="secondary" className={buttonClassName} onClick={openAccountModal}>
          <span className="flex-grow inline-flex gap-2.5 items-center">
            <Logo className="text-orange-500" />
            <span className="flex-grow text-left">{address ? <TruncatedHex hex={address} /> : null}</span>
          </span>
        </Button>
      </Shadow>
      <AccountModal open={accountModalOpen && !accountModalHidden} onOpenChange={toggleAccountModal} />
    </>
  );
}
