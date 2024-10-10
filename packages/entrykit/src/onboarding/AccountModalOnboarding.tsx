import { useAccount } from "wagmi";
import { ConnectWallet } from "../content/ConnectWallet";
import { ConnectedWallet } from "../content/ConnectedWallet";
import { Steps } from "./Steps";
import { usePasskeySteps } from "./usePasskeySteps";

export function AccountModalOnboarding() {
  const userAccount = useAccount();
  const passkeySteps = usePasskeySteps();

  if (userAccount.status !== "connected") {
    return <ConnectWallet />;
  }

  return (
    <Steps
      steps={[
        {
          id: "connectWallet",
          label: "Connect wallet",
          isComplete: true,
          canComplete: true,
          content: <ConnectedWallet userAddress={userAccount.address} />,
        },
        ...passkeySteps,
        // TODO: wallet steps
      ]}
    />
  );
}
