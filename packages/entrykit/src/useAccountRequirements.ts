import { useAccount } from "wagmi";
import { useAppSigner } from "./useAppSigner";
import { useHasDelegation } from "./useHasDelegation";
import { useMemo } from "react";
import { useGasTankBalance } from "./useGasTankBalance";
import { useIsGasSpender } from "./useIsGasSpender";
import { useSignRegisterDelegation } from "./steps/app-account/useSignRegisterDelegation";

export const accountRequirements = [
  "connectedWallet",
  "appSigner",
  "gasAllowance",
  "gasSpender",
  "accountDelegation",
  "accountDelegationConfirmed",
] as const;

export type AccountRequirement = (typeof accountRequirements)[number];

export type UseAccountRequirementsResult = {
  readonly requirement: AccountRequirement | null;
  readonly requirements: readonly AccountRequirement[];
};

export function useAccountRequirements(): UseAccountRequirementsResult {
  const userAccount = useAccount();
  const [appSignerAccount] = useAppSigner();
  const { gasTankBalance } = useGasTankBalance();
  const { isGasSpender } = useIsGasSpender();
  const { hasDelegation } = useHasDelegation();
  const { registerDelegationSignature } = useSignRegisterDelegation();

  // TODO: move to useQuery for caching + pending states

  const requirements = useMemo(() => {
    const satisfiesRequirement = {
      connectedWallet: () => userAccount.status === "connected",
      appSigner: () => appSignerAccount != null,
      gasAllowance: () => gasTankBalance != null && gasTankBalance > 0n,
      gasSpender: () => isGasSpender === true,
      accountDelegation: () => hasDelegation === true || registerDelegationSignature != null,
      accountDelegationConfirmed: () => hasDelegation === true,
    } as const satisfies Record<AccountRequirement, () => boolean>;

    const requirements = accountRequirements.filter((requirement) => !satisfiesRequirement[requirement]());

    return {
      requirement: requirements.at(0) ?? null,
      requirements,
    };
  }, [appSignerAccount, gasTankBalance, hasDelegation, isGasSpender, registerDelegationSignature, userAccount.status]);

  return requirements;
}
