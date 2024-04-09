import { useAccount } from "wagmi";
import { useAppSigner } from "./useAppSigner";
import { useHasDelegation } from "./useHasDelegation";
import { useMemo } from "react";
import { useGasTankBalance } from "./useGasTankBalance";
import { useIsGasSpender } from "./useIsGasSpender";
import { useConfig } from "./MUDAccountKitProvider";

export const accountRequirements = [
  "connectedWallet",
  "connectedChain",
  "appSigner",
  "gasAllowance",
  "gasSpender",
  "accountDelegation",
] as const;

export type AccountRequirement = (typeof accountRequirements)[number];

export type UseAccountRequirementsResult = {
  readonly requirement: AccountRequirement | null;
  readonly requirements: readonly AccountRequirement[];
};

export function useAccountRequirements(): UseAccountRequirementsResult {
  const { chainId } = useConfig();
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
    } as const satisfies Record<AccountRequirement, () => boolean>;

    const requirements = accountRequirements.filter((requirement) => !satisfiesRequirement[requirement]());

    return {
      requirement: requirements.at(0) ?? null,
      requirements,
    };
  }, [appSignerAccount, chainId, gasTankBalance, hasDelegation, isGasSpender, userAccount.chainId, userAccount.status]);
}
