import { createStore } from "zustand/vanilla";
import { AccountRequirement, useAccountRequirements } from "./useAccountRequirements";
import { useStore } from "zustand";
import { useCallback } from "react";
import { keysOf } from "./utils/keysOf";

// TODO: rename steps dirs to match below
export const onboardingSteps = {
  "app-signer": {
    label: "Set up account",
    requires: ["connectedWallet"],
    satisfies: ["appSigner"],
  },
  "gas-tank": {
    label: "Deposit funds",
    requires: ["connectedWallet", "appSigner"],
    satisfies: ["gasAllowance", "gasSpender"],
  },
  "account-delegation": {
    label: "Sign in to account",
    requires: ["connectedWallet", "appSigner", "gasAllowance", "gasSpender"],
    satisfies: ["accountDelegation"],
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
  const setStep = useCallback((step: OnboardingStep): void => store.setState({ step }), []);
  const { requirements } = useAccountRequirements();

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
    steps,
  };
}
