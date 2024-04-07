import { useAccount } from "wagmi";
import { LoginRequirement, loginRequirements } from "./common";
import { useAppSigner } from "./useAppSigner";
import { useHasDelegation } from "./useHasDelegation";
import { useMemo } from "react";
import { useGasTankBalance } from "./useGasTankBalance";
import { useIsGasSpender } from "./useIsGasSpender";
import { useLoginConfig } from "./Context";

export type UseLoginRequirementsResult = {
  readonly requirement: LoginRequirement | null;
  readonly requirements: readonly LoginRequirement[];
};

export function useLoginRequirements(): UseLoginRequirementsResult {
  const { chainId } = useLoginConfig();
  const userAccount = useAccount();

  const [appSignerAccount] = useAppSigner();
  const gasTankBalance = useGasTankBalance();
  const isGasSpender = useIsGasSpender();
  const hasDelegation = useHasDelegation();

  return useMemo(() => {
    const satisfiesRequirement = {
      connectedWallet: () => userAccount.status === "connected",
      connectedChain: () => userAccount.chainId === chainId,
      appSigner: () => appSignerAccount != null,
      gasAllowance: () => gasTankBalance != null && gasTankBalance > 0n,
      gasSpender: () => isGasSpender === true,
      accountDelegation: () => hasDelegation === true,
    } as const satisfies Record<LoginRequirement, () => boolean>;

    const requirements = loginRequirements.filter((requirement) => !satisfiesRequirement[requirement]());

    return {
      requirement: requirements.at(0) ?? null,
      requirements,
    };
  }, [appSignerAccount, chainId, gasTankBalance, hasDelegation, isGasSpender, userAccount.chainId, userAccount.status]);
}
