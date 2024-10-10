import { useAccount } from "wagmi";
import { ConnectWallet } from "../content/ConnectWallet";
import { ConnectedWallet } from "../content/ConnectedWallet";
import { Steps } from "./Steps";
import { CreateAppAccount } from "../content/CreateAppAccount";
import { useAllowance } from "./useAllowance";
import { Address } from "viem";
import { ClaimGasPass } from "../content/ClaimGasPass";

export function ConnectedSteps({ userAddress }: { userAddress: Address }) {
  const allowance = useAllowance(userAddress);
  return (
    <Steps
      steps={[
        {
          id: "connectWallet",
          label: "Sign in",
          isComplete: true,
          canComplete: true,
          content: <ConnectedWallet userAddress={userAddress} />,
        },
        {
          id: "claimGasPass",
          label: "Top up",
          isComplete: (allowance.data?.allowance ?? 0n) > 0n,
          canComplete: true,
          content: <ClaimGasPass userAddress={userAddress} />,
        },
        {
          id: "createAppAccount",
          label: "Set up account",
          isComplete: false, // TODO
          canComplete: true,
          content: <CreateAppAccount />,
        },
      ]}
    />
  );
}

export function AccountModalOnboarding() {
  const userAccount = useAccount();

  if (userAccount.status !== "connected") {
    return <ConnectWallet />;
  }

  return <ConnectedSteps userAddress={userAccount.address} />;
}
