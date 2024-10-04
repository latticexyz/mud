import { createStore } from "zustand/vanilla";
import { AccountRequirement, useAccountRequirements } from "./useAccountRequirements";
import { useStore } from "zustand";
import { useCallback, useMemo } from "react";
import { keysOf } from "./utils/keysOf";
import { useAccountModal } from "./useAccountModal";

export const onboardingSteps = {
  wallet: {
    label: "Connect",
    requires: [],
    satisfies: ["connectedWallet"],
  },
  "app-account": {
    label: "Sign in",
    requires: ["connectedWallet"],
    satisfies: ["appSigner", "accountDelegation"],
  },
  deposit: {
    label: "Top up",
    requires: ["connectedWallet", "appSigner", "accountDelegation"],
    satisfies: ["gasAllowance", "gasSpender"],
  },
  // TODO: rework this, feels weird to show this as a step on the left
  finalizing: {
    label: "Finalizing",
    requires: ["connectedWallet", "gasAllowance", "gasSpender", "accountDelegation"],
    satisfies: ["accountDelegationConfirmed"],
  },
} as const satisfies {
  readonly [key: string]: {
    readonly label: string;
    readonly requires: readonly AccountRequirement[];
    readonly satisfies: readonly AccountRequirement[];
  };
};

export type OnboardingStep = keyof typeof onboardingSteps;

const store = createStore<{ readonly step: OnboardingStep | null }>(() => ({ step: null }));

export function useOnboardingSteps() {
  const initialStep = useStore(store, (state) => state.step);
  const { closeAccountModal } = useAccountModal();
  const { requirements } = useAccountRequirements();

  const { step, nextStep, steps } = useMemo(() => {
    const steps = keysOf(onboardingSteps).map((id) => {
      const step = onboardingSteps[id];
      return {
        id,
        ...step,
        canComplete: step.requires.every((req) => !requirements.includes(req)),
        isComplete: step.satisfies.every((req) => !requirements.includes(req)),
      };
    });

    const nextStep = steps.filter((step) => !step.isComplete).at(0);
    const step = initialStep ?? nextStep?.id ?? steps.filter((step) => step.id !== "finalizing").at(-1)!.id;

    return {
      step,
      nextStep,
      steps,
    };
  }, [initialStep, requirements]);

  const setStep = useCallback((step: OnboardingStep): void => {
    store.setState({ step });
  }, []);

  const resetStep = useCallback((): void => {
    store.setState({ step: null });
    if (!nextStep) {
      closeAccountModal();
    }
  }, [closeAccountModal, nextStep]);

  return useMemo(
    () => ({
      step,
      steps,
      setStep,
      resetStep,
      nextStep,
    }),
    [nextStep, resetStep, setStep, step, steps],
  );
}
