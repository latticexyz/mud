import { useAccount } from "wagmi";
import { AccountModalNav } from "../AccoutModalNav";
import { ConnectWallet } from "../onboarding/ConnectWallet";
import { ConnectedWallet } from "../onboarding/ConnectedWallet";

export function ConnectWalletStep() {
  const userAccount = useAccount();

  if (userAccount.status !== "connected") {
    return <ConnectWallet />;
  }

  return (
    <>
      <AccountModalNav />
      <ConnectedWallet userAddress={userAccount.address} />
    </>
  );
}
