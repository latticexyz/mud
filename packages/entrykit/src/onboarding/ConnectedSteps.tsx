import { useEffect, useMemo, useRef, useState } from "react";
import { ConnectedClient } from "../common";
import { twMerge } from "tailwind-merge";
import { usePrerequisites } from "./usePrerequisites";
import { Wallet } from "./Wallet";
import { Allowance } from "./quarry/Allowance";
import { Session } from "./Session";
import { Step } from "./common";
import { Address } from "viem";
import { useAccountModal } from "../useAccountModal";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { getPaymaster } from "../getPaymaster";
import { GasBalance } from "./GasBalance";
import { DepositFormContainer } from "./deposit/DepositFormContainer";

export type Props = {
  userClient: ConnectedClient;
  initialUserAddress: Address | undefined;
};

export function ConnectedSteps({ userClient, initialUserAddress }: Props) {
  const { chain } = useEntryKitConfig();
  const paymaster = getPaymaster(chain);
  const [showDepositForm, setShowDepositForm] = useState(false);

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

  const { sessionAddress, hasAllowance, isSpender, hasDelegation, hasGasBalance } = prerequisites ?? {};

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
          content: (props) => (
            // TODO: rename onSubmit
            <GasBalance {...props} sessionAddress={sessionAddress} onSubmit={() => setShowDepositForm(true)} />
          ),
        });
      }
    } else if (paymaster.type === "quarry") {
      steps.push({
        id: "allowance",
        isComplete: !!hasAllowance,
        content: (props) => <Allowance {...props} userAddress={userAddress} />,
      });
    }

    steps.push({
      id: "session",
      isComplete: !!isSpender && !!hasDelegation,
      content: (props) => (
        <Session {...props} userClient={userClient} registerSpender={!isSpender} registerDelegation={!hasDelegation} />
      ),
    });

    return steps;
  }, [hasAllowance, hasDelegation, hasGasBalance, isSpender, paymaster, sessionAddress, userAddress, userClient]);

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
        !showDepositForm && "divide-y divide-neutral-800",
        "animate-in animate-duration-300 fade-in slide-in-from-bottom-8",
      )}
    >
      {/* // TODO: rename go back */}
      {showDepositForm && <DepositFormContainer goBack={() => setShowDepositForm(false)} />}
      {!showDepositForm &&
        steps.map((step, i) => {
          const isActive = step === activeStep;
          const isExpanded = isActive || completedSteps.length === steps.length;
          const isDisabled = !step.isComplete && activeStepIndex !== -1 && i > activeStepIndex;
          const content = step.content({ isActive, isExpanded });

          // Only show the deposit step if we're showing the form, or hide all other steps if we're showing the form
          if (showDepositForm && step.id !== "deposit") {
            return null;
          }

          return (
            <div
              key={step.id}
              className={twMerge(
                "py-8 flex flex-col justify-center",
                isActive ? "flex-grow" : null,
                showDepositForm ? "!py-0" : null,
              )}
            >
              <div className={twMerge("flex flex-col", isDisabled ? "opacity-30 pointer-events-none" : null)}>
                {content}
              </div>
            </div>
          );
        })}
    </div>
  );
}
