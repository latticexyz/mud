import { createStore } from "zustand/vanilla";
import { AccountRequirement, useAccountRequirements } from "./useAccountRequirements";
import { useStore } from "zustand";
import { useCallback, useMemo } from "react";
import { keysOf } from "./utils/keysOf";

export const onboardingSteps = {
  wallet: {
    label: "Connect wallet",
    requires: [],
    satisfies: ["connectedWallet"],
  },
  "app-account": {
    label: "Sign in to app",
    requires: ["connectedWallet"],
    satisfies: ["appSigner", "accountDelegation"],
  },
  "gas-tank": {
    label: "Fund gas tank",
    requires: ["connectedWallet", "appSigner", "accountDelegation"],
    satisfies: ["gasAllowance", "gasSpender"],
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
  const { requirements } = useAccountRequirements();

  const setStep = useCallback((step: OnboardingStep): void => {
    store.setState({ step });
  }, []);

  const resetStep = useCallback((): void => {
    store.setState({ step: null });
  }, []);

  return useMemo(() => {
    const steps = keysOf(onboardingSteps).map((id) => {
      const step = onboardingSteps[id];
      return {
        id,
        ...step,
        canComplete: step.requires.every((req) => !requirements.includes(req)),
        isComplete: step.satisfies.every((req) => !requirements.includes(req)),
      };
    });

    const lastIncompleteStep = steps.filter((step) => !step.isComplete).at(0) ?? steps.at(-1)!;
    const step = initialStep ?? lastIncompleteStep.id;

    return {
      step,
      setStep,
      resetStep,
      steps,
    };
  }, [initialStep, requirements, resetStep, setStep]);
}
