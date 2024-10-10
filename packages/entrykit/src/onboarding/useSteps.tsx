import { ConnectedWallet } from "./ConnectedWallet";
import { SetupAppAccount } from "./SetupAppAccount";
import { useAllowance } from "./useAllowance";
import { ClaimGasPass } from "./ClaimGasPass";
import { useAppAccountClient } from "./useAppAccountClient";
import { useSpender } from "./useSpender";
import { ConnectedClient, Step } from "./common";
import { useDelegation } from "./useDelegation";
import { useMemo } from "react";
import { unlimitedDelegationControlId } from "../common";

export function useSteps(userClient: ConnectedClient | undefined): readonly Step[] {
  const userAddress = userClient?.account.address;
  const allowance = useAllowance(userAddress);
  const appAccountClient = useAppAccountClient(userAddress);

  const spender = useSpender(appAccountClient.data?.account.address);
  const isSpender = userAddress && spender.data ? spender.data.user.toLowerCase() === userAddress.toLowerCase() : false;

  const delegation = useDelegation(userClient?.account.address, appAccountClient.data?.account.address);
  const hasDelegation = delegation.data ? delegation.data?.delegationControlId === unlimitedDelegationControlId : false;

  return useMemo(() => {
    if (!userAddress) {
      return [
        {
          id: "connectWallet",
          label: "Sign in",
          isComplete: false,
          content: null,
        },
      ];
    }

    return [
      {
        id: "connectWallet",
        label: "Sign in",
        isComplete: true,
        content: <ConnectedWallet userAddress={userAddress} />,
      },
      {
        id: "claimGasPass",
        label: "Top up",
        isComplete: (allowance.data?.allowance ?? 0n) > 0n,
        content: <ClaimGasPass userAddress={userAddress} />,
      },
      {
        id: "setupAppAccount",
        label: "Set up account",
        isComplete: isSpender && hasDelegation,
        content: (
          <SetupAppAccount userClient={userClient} registerSpender={!isSpender} registerDelegation={!hasDelegation} />
        ),
      },
    ];
  }, [allowance.data?.allowance, hasDelegation, isSpender, userAddress, userClient]);
}
