import { ConnectedWallet } from "./ConnectedWallet";
import { Steps } from "./Steps";
import { CreateAppAccount } from "./CreateAppAccount";
import { useAllowance } from "./useAllowance";
import { Address } from "viem";
import { ClaimGasPass } from "./ClaimGasPass";

export type Props = {
  userAddress: Address;
};

export function ConnectedSteps({ userAddress }: Props) {
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
