import { useEffect, useMemo, useRef, useState } from "react";
import { Address } from "viem";
import { twMerge } from "tailwind-merge";
import { ConnectedClient } from "../common";
import { usePrerequisites } from "./usePrerequisites";
import { Wallet } from "./Wallet";
import { Allowance } from "./quarry/Allowance";
import { Session } from "./Session";
import { Step } from "./common";
import { useAccountModal } from "../useAccountModal";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { getPaymaster } from "../getPaymaster";
import { GasBalance } from "./GasBalance";
import { GasBalance as GasBalanceQuarry } from "./quarry/GasBalance";
import { DepositFormContainer } from "./deposit/DepositFormContainer";
import { ArrowLeftIcon } from "../icons/ArrowLeftIcon";

export type Props = {
  userClient: ConnectedClient;
  initialUserAddress: Address | undefined;
};

export function ConnectedSteps({ userClient, initialUserAddress }: Props) {
  const { chain } = useEntryKitConfig();
  const paymaster = getPaymaster(chain);
  const [showDepositForm, setShowDepositForm] = useState(false); // TODO: do this differently?

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

  const { sessionAddress, hasAllowance, isSpender, hasDelegation, hasGasBalance, hasQuarryBalance } =
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
      if (paymaster.isGasPass) {
        steps.push({
          id: "allowance",
          isComplete: !!hasAllowance,
          content: (props) => <Allowance {...props} userAddress={userAddress} />,
        });
      } else {
        steps.push({
          id: "gasBalanceQuarry",
          isComplete: !!hasQuarryBalance,
          content: (props) => (
            <GasBalanceQuarry {...props} userAddress={userAddress} onTopUp={() => setShowDepositForm(true)} />
          ),
        });
      }
    }

    steps.push({
      id: "session",
      isComplete: !!isSpender && !!hasDelegation,
      content: (props) => (
        <Session {...props} userClient={userClient} registerSpender={!isSpender} registerDelegation={!hasDelegation} />
      ),
    });

    return steps;
  }, [
    hasAllowance,
    hasDelegation,
    hasGasBalance,
    hasQuarryBalance,
    isSpender,
    paymaster,
    sessionAddress,
    userAddress,
    userClient,
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
    <>
      {showDepositForm && (
        <div className="absolute top-0 left-0">
          <div
            className="flex items-center justify-center w-10 h-10 text-white/20 hover:text-white/40 cursor-pointer"
            onClick={() => setShowDepositForm(false)}
          >
            <ArrowLeftIcon className="m-0" />
          </div>
        </div>
      )}

      <div
        className={twMerge(
          "px-8 flex flex-col",
          showDepositForm && "divide-y divide-neutral-800",
          "animate-in animate-duration-300 fade-in slide-in-from-bottom-8",
        )}
      >
        {showDepositForm && <DepositFormContainer />}
        {!showDepositForm &&
          steps.map((step, i) => {
            const isActive = step === activeStep;
            const isExpanded = isActive || completedSteps.length === steps.length;
            const isDisabled = !step.isComplete && activeStepIndex !== -1 && i > activeStepIndex;
            const content = step.content({ isActive, isExpanded });

            return (
              <div
                key={step.id}
                className={twMerge("py-8 flex flex-col justify-center", isActive ? "flex-grow" : null)}
              >
                <div className={twMerge("flex flex-col", isDisabled ? "opacity-30 pointer-events-none" : null)}>
                  {content}
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}
