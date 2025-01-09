import { Button } from "../ui/Button";
import { useSetupSession } from "./useSetupSession";
import { ConnectedClient } from "../common";
import { useEffect } from "react";
import { useSessionClient } from "../useSessionClient";

export type Props = {
  isActive: boolean;
  isExpanded: boolean;
  userClient: ConnectedClient;
  registerSpender: boolean;
  registerDelegation: boolean;
};

export function Session({ isActive, isExpanded, userClient, registerSpender, registerDelegation }: Props) {
  const { data: sessionClient } = useSessionClient(userClient.account.address);
  const setup = useSetupSession({ userClient });
  const hasSession = !registerDelegation && !registerDelegation;

  useEffect(() => {
    // There seems to be a tanstack-query bug(?) where multiple simultaneous renders loses
    // state between the two mutations. They're not treated as shared state but rather
    // individual mutations, even though the keys match. And the one we want the status of
    // seems to stay pending. This is sorta resolved by triggering this after a timeout.
    const timer = setTimeout(() => {
      if (isActive && setup.status === "idle" && sessionClient && !hasSession) {
        setup.mutate({
          sessionClient,
          registerSpender,
          registerDelegation,
        });
      }
    });
    return () => clearTimeout(timer);
  }, [hasSession, isActive, registerDelegation, registerSpender, sessionClient, setup]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div>
          <div>Session</div>
          <div className="font-mono text-white">{hasSession ? "Enabled" : "Set up"}</div>
        </div>
        {hasSession ? (
          <Button variant="tertiary" className="flex-shrink-0 text-sm p-1 w-28" autoFocus={isActive} disabled>
            Enabled
          </Button>
        ) : (
          <Button
            variant={isActive ? "primary" : "tertiary"}
            className="flex-shrink-0 text-sm p-1 w-28"
            autoFocus={isActive}
            pending={!sessionClient || setup.status === "pending"}
            onClick={
              sessionClient
                ? () =>
                    setup.mutate({
                      sessionClient,
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
