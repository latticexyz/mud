import { useEffect, useMemo, useRef, useState } from "react";
import { ConnectedClient } from "../common";
import { twMerge } from "tailwind-merge";
import { usePrerequisites } from "./usePrerequisites";
import { Wallet } from "./Wallet";
import { Allowance } from "./Allowance";
import { Session } from "./Session";
import { Step } from "./common";
import { Address } from "viem";
import { useAccountModal } from "../useAccountModal";

export type Props = {
  userClient: ConnectedClient;
  initialAddress: Address | undefined;
};

export function ConnectedSteps({ userClient, initialAddress }: Props) {
  const userAddress = userClient.account.address;
  const { data: prerequisites } = usePrerequisites(userAddress);

  const { closeAccountModal } = useAccountModal();
  const isNewConnection = userAddress !== initialAddress;

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

  const { hasAllowance, isSpender, hasDelegation } = prerequisites ?? {};

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

    return [
      {
        id: "wallet",
        isComplete: true,
        content: (props) => <Wallet {...props} userAddress={userAddress} />,
      },
      {
        id: "allowance",
        isComplete: !!hasAllowance,
        content: (props) => <Allowance {...props} userAddress={userAddress} />,
      },
      {
        id: "session",
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
        "min-h-[26rem] px-8 flex flex-col divide-y divide-neutral-800",
        "animate-in animate-duration-300 fade-in slide-in-from-bottom-8",
      )}
    >
      {steps.map((step, i) => {
        const isActive = step === activeStep;
        const isExpanded = isActive || completedSteps.length === steps.length;
        const isDisabled = !step.isComplete && activeStepIndex !== -1 && i > activeStepIndex;
        return (
          <div key={step.id} className={twMerge("py-8 flex flex-col justify-center", isActive ? "flex-grow" : null)}>
            <div className={twMerge("flex flex-col", isDisabled ? "opacity-30 pointer-events-none" : null)}>
              {step.content({ isActive, isExpanded })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
