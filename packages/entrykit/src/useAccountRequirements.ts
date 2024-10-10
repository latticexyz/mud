import { useAccount, useBalance } from "wagmi";
import { useAppSigner } from "./useAppSigner";
import { useHasDelegation } from "./useHasDelegation";
import { useMemo } from "react";
import { useSignRegisterDelegation } from "./steps/app-account/useSignRegisterDelegation";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useAppAccount } from "./useAppAccount";

export const accountRequirements = [
  "walletConnected",
  // wallet has balance or has allowance
  "walletFunded",
  "appSigner",
  // app account has balance or is a spender of wallet allowance
  "appAccountFunded",
  // EOA can sign ahead of executing delegation to group signature collection steps
  "appAccountDelegationPrepared",
  "appAccountDelegation",
] as const;

export type AccountRequirement = (typeof accountRequirements)[number];

export type UseAccountRequirementsResult = {
  readonly requirement: AccountRequirement | null;
  readonly requirements: readonly AccountRequirement[];
};

const minBalance = 100_000n;

export function useAccountRequirements(): UseAccountRequirementsResult {
  const { chainId } = useEntryKitConfig();

  const wallet = useAccount();
  const walletBalance = useBalance({ chainId, address: wallet.address });
  const walletAllowance = 0n; // TODO

  const [appSigner] = useAppSigner();

  const { data: appAccount } = useAppAccount();
  const appAccountBalance = useBalance({ chainId, address: appAccount?.address });
  const appAccountAllowance = 0n; // TODO

  const { hasDelegation } = useHasDelegation();
  const { registerDelegationSignature: hasSignedDelegation } = useSignRegisterDelegation();

  // TODO: move to useQuery for caching + pending states

  const requirements = useMemo(() => {
    const satisfiesRequirement = {
      walletConnected: () => wallet.status === "connected",
      walletFunded: () => (walletBalance?.data?.value ?? 0n) > minBalance || walletAllowance > minBalance,
      appSigner: () => appSigner != null,
      appAccountFunded: () => (appAccountBalance?.data?.value ?? 0n) > minBalance || appAccountAllowance > minBalance,
      appAccountDelegationPrepared: () => hasDelegation === true || hasSignedDelegation != null,
      appAccountDelegation: () => hasDelegation === true,
    } as const satisfies Record<AccountRequirement, () => boolean>;

    const requirements = accountRequirements.filter((requirement) => !satisfiesRequirement[requirement]());

    return {
      requirement: requirements.at(0) ?? null,
      requirements,
    };
  }, [
    appAccountAllowance,
    appAccountBalance?.data?.value,
    appSigner,
    hasDelegation,
    hasSignedDelegation,
    wallet.status,
    walletAllowance,
    walletBalance?.data?.value,
  ]);

  return requirements;
}
