import { useAccount } from "wagmi";
import { ConnectWallet } from "./onboarding/ConnectWallet";
import { ConnectedSteps } from "./onboarding/ConnectedSteps";

export function AccountModalContent() {
  const userAccount = useAccount();

  if (userAccount.status !== "connected") {
    return <ConnectWallet />;
  }

  return <ConnectedSteps userAddress={userAccount.address} />;
}
