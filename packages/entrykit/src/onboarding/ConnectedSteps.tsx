import { useEffect, useMemo, useRef, useState } from "react";
import { Address } from "viem";
import { twMerge } from "tailwind-merge";
import { ConnectedClient } from "../common";
import { usePrerequisites } from "./usePrerequisites";
import { Wallet } from "./Wallet";
import { Session } from "./Session";
import { Step } from "./common";
import { useAccountModal } from "../useAccountModal";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { getPaymaster } from "../getPaymaster";
import { GasBalance } from "./GasBalance";
import { GasBalance as QuarryGasBalance } from "./quarry/GasBalance";
import { Connector } from "wagmi";

export type Props = {
  connector: Connector;
  userClient: ConnectedClient;
  initialUserAddress: Address | undefined;
};

export function ConnectedSteps({ connector, userClient, initialUserAddress }: Props) {
  const { chain, paymasterOverride } = useEntryKitConfig();
  const paymaster = getPaymaster(chain, paymasterOverride);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const userAddress = userClient.account.address;
  const { data: prerequisites, error: prerequisitesError } = usePrerequisites(userAddress);

  useEffect(() => {
    if (prerequisitesError) {
      console.error("Could not get prerequisites", prerequisitesError);
    }
  }, [prerequisitesError]);

  const { closeAccountModal } = useAccountModal();
  const isNewConnection = userAddress !== initialUserAddress;

  const initialPrerequisites = useRef(prerequisites);
  useEffect(() => {
    if (prerequisites == null) return;
    if (initialPrerequisites.current == null) {
      initialPrerequisites.current = prerequisites;
    }

    if (prerequisites.complete) {
      if (isNewConnection || !initialPrerequisites.current.complete) {
        closeAccountModal();
      }
    }
  }, [closeAccountModal, isNewConnection, prerequisites]);

  const { sessionAddress, hasAllowance, isSpender, hasDelegation, hasGasBalance, hasQuarryGasBalance } =
    prerequisites ?? {};

  const steps = useMemo((): readonly Step[] => {
    if (!userAddress) {
      return [
        {
          id: "wallet",
          isComplete: false,
          content: () => null,
        },
      ];
    }

    const steps: Step[] = [
      {
        id: "wallet",
        isComplete: true,
        content: (props) => <Wallet {...props} userAddress={userAddress} />,
      },
    ];

    if (!paymaster) {
      if (sessionAddress != null) {
        steps.push({
          id: "gasBalance",
          isComplete: !!hasGasBalance,
          content: (props) => <GasBalance {...props} sessionAddress={sessionAddress} />,
        });
      }
    } else if (paymaster.type === "quarry") {
      steps.push({
        id: "gasBalanceQuarry",
        isComplete: !!hasQuarryGasBalance || !!hasAllowance,
        content: (props) => <QuarryGasBalance {...props} userAddress={userAddress} paymaster={paymaster} />,
      });
    }

    steps.push({
      id: "session",
      isComplete: !!isSpender && !!hasDelegation,
      content: (props) => (
        <Session
          {...props}
          userClient={userClient}
          connector={connector}
          registerSpender={!isSpender}
          registerDelegation={!hasDelegation}
        />
      ),
    });

    return steps;
  }, [
    hasAllowance,
    hasDelegation,
    hasGasBalance,
    hasQuarryGasBalance,
    isSpender,
    paymaster,
    sessionAddress,
    userAddress,
    userClient,
    connector,
  ]);

  const [selectedStepId] = useState<null | string>(null);
  const nextStep = steps.find((step) => step.content != null && !step.isComplete);
  const completedSteps = steps.filter((step) => step.isComplete);
  const activeStep =
    (selectedStepId != null ? steps.find((step) => step.id === selectedStepId) : null) ??
    nextStep ??
    (completedSteps.length < steps.length ? completedSteps.at(-1) : null);
  const activeStepIndex = activeStep ? steps.indexOf(activeStep) : -1;

  return (
    <div
      className={twMerge(
        "px-8 flex flex-col",
        "divide-y divide-neutral-800",
        "animate-in animate-duration-300 fade-in slide-in-from-bottom-8",
      )}
    >
      {steps.map((step, i) => {
        const isActive = step === activeStep;
        const isExpanded = isActive || completedSteps.length === steps.length;
        const isDisabled = !step.isComplete && activeStepIndex !== -1 && i > activeStepIndex;
        const isFocused = focusedId === step.id;

        const content = step.content({
          isActive,
          isExpanded,
          isFocused,
          setFocused: (focused: boolean) => setFocusedId(focused ? step.id : null),
        });

        if (focusedId) {
          if (step.id === focusedId) {
            return content;
          }
          return null;
        }

        return (
          <div key={step.id} className={twMerge("py-8 flex flex-col justify-center", isActive ? "flex-grow" : null)}>
            <div className={twMerge("flex flex-col", isDisabled ? "opacity-30 pointer-events-none" : null)}>
              {content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
