import { useMemo } from "react";
import { ConnectedClient, unlimitedDelegationControlId } from "../common";
import { Step, minGasBalance } from "./common";
import { useAllowance } from "./useAllowance";
import { useAppAccountClient } from "../useAppAccountClient";
import { useSpender } from "./useSpender";
import { useDelegation } from "./useDelegation";
import { Wallet } from "./Wallet";
import { Allowance } from "./Allowance";
import { Session } from "./Session";

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
          id: "wallet",
          label: "Sign in",
          isComplete: false,
          content: () => null,
        },
      ];
    }

    return [
      {
        id: "wallet",
        label: "Sign in",
        isComplete: true,
        content: (props) => <Wallet {...props} userAddress={userAddress} />,
      },
      {
        id: "allowance",
        label: "Top up",
        isComplete: (allowance.data?.allowance ?? 0n) >= minGasBalance,
        content: (props) => <Allowance {...props} userAddress={userAddress} />,
      },
      {
        id: "session",
        label: "Set up account",
        isComplete: isSpender && hasDelegation,
        content: (props) => (
          <Session
            {...props}
            userClient={userClient}
            registerSpender={!isSpender}
            registerDelegation={!hasDelegation}
          />
        ),
      },
    ];
  }, [allowance.data?.allowance, hasDelegation, isSpender, userAddress, userClient]);
}
