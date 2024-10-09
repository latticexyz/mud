import { useAccount } from "wagmi";
import { AccountModalNav } from "../AccoutModalNav";
import { ConnectWallet } from "../content/ConnectWallet";
import { ConnectedWallet } from "../content/ConnectedWallet";

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
