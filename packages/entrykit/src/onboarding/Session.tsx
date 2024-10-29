import { Button } from "../ui/Button";
import { useSetupSession } from "./useSetupSession";
import { ConnectedClient } from "../common";
import { useEffect, useRef } from "react";
import { useSessionAccount } from "../useSessionAccount";

export type Props = {
  isActive: boolean;
  isExpanded: boolean;
  userClient: ConnectedClient;
  registerSpender: boolean;
  registerDelegation: boolean;
};

export function Session({ isActive, isExpanded, userClient, registerSpender, registerDelegation }: Props) {
  const sessionAccount = useSessionAccount(userClient.account.address);
  const sessionAddress = sessionAccount.data?.address;
  const setup = useSetupSession();

  const hasSession = !registerDelegation && !registerDelegation;

  // I assumed `queryClient.isMutating` would be useful to avoid multiple mutations at once,
  // but it seems like it's doing something else internally where kicking off a mutation
  // twice immediately (i.e. two renders) results in both returning 2 pending mutations.
  //
  // I also tried moving this into `useSetupSession` with `onMutate`, etc, but that seems
  // to just mimick what I am seeing with the behavior of `useMutation`.
  //
  // Working around this with a ref :(
  const isMutatingRef = useRef(false);
  useEffect(() => {
    if (isActive && setup.status === "idle" && sessionAddress && !hasSession && !isMutatingRef.current) {
      isMutatingRef.current = true;
      setup.mutate(
        {
          userClient,
          sessionAddress,
          registerSpender,
          registerDelegation,
        },
        { onSettled: () => (isMutatingRef.current = false) },
      );
    }
  }, [isActive, hasSession, registerDelegation, registerSpender, sessionAddress, setup, userClient]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div>
          <div>Session</div>
          <div className="font-mono text-white">{hasSession ? "Enabled" : "Set up"}</div>
        </div>
        {hasSession ? (
          <Button variant={isActive ? "primary" : "secondary"} className="flex-shrink-0 text-sm p-1 w-28" disabled>
            {/* TODO: revoke */}
            Disable
          </Button>
        ) : (
          <Button
            variant={isActive ? "primary" : "secondary"}
            className="flex-shrink-0 text-sm p-1 w-28"
            pending={!sessionAddress || setup.status === "pending"}
            onClick={
              sessionAddress
                ? () =>
                    setup.mutate({
                      userClient,
                      sessionAddress,
                      registerSpender,
                      registerDelegation,
                    })
                : undefined
            }
          >
            Enable
          </Button>
        )}
      </div>
      {isExpanded ? (
        <p className="text-sm">You can perform actions in this app without interruptions for approvals.</p>
      ) : null}
    </div>
  );
}
