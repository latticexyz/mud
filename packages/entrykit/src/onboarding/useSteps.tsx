import { useMemo } from "react";
import { ConnectedClient } from "../common";
import { Step } from "./common";
import { Wallet } from "./Wallet";
import { Allowance } from "./Allowance";
import { Session } from "./Session";
import { usePrerequisites } from "./usePrerequisites";

export function useSteps(userClient: ConnectedClient | undefined): readonly Step[] {
  const userAddress = userClient?.account.address;

  const prerequisites = usePrerequisites(userAddress);
  const { hasAllowance, isSpender, hasDelegation } = prerequisites.data ?? {};

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
        isComplete: !!hasAllowance,
        content: (props) => <Allowance {...props} userAddress={userAddress} />,
      },
      {
        id: "session",
        label: "Set up account",
        isComplete: !!isSpender && !!hasDelegation,
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
  }, [hasAllowance, hasDelegation, isSpender, userAddress, userClient]);
}
