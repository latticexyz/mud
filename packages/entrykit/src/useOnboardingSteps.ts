import { createStore } from "zustand/vanilla";
import { useAccountRequirements } from "./useAccountRequirements";
import { useStore } from "zustand";
import { useCallback, useMemo } from "react";
import { keysOf } from "./utils/keysOf";
import { useAccountModal } from "./useAccountModal";
import { useAccount } from "wagmi";
import { passkeyConnector } from "./passkey/passkeyConnector";
import { StepId, Steps, passkeySteps, walletSteps } from "./steps";

const store = createStore<{ readonly step: StepId | null }>(() => ({ step: null }));

export function useOnboardingSteps() {
  const selectedStep = useStore(store, (state) => state.step);
  const { closeAccountModal } = useAccountModal();
  const { requirements } = useAccountRequirements();
  const wallet = useAccount();

  const { step, nextStep, steps } = useMemo(() => {
    const onboardingSteps: Steps = wallet.connector?.type === passkeyConnector.type ? passkeySteps : walletSteps;
    const steps = keysOf(onboardingSteps).map((id) => {
      const step = onboardingSteps[id]!;
      return {
        id,
        ...step,
        canComplete: step.requires.every((req) => !requirements.includes(req)),
        isComplete: step.satisfies.every((req) => !requirements.includes(req)),
      };
    });

    const nextStep = steps.filter((step) => !step.isComplete).at(0);
    const step = selectedStep ?? nextStep?.id ?? steps.filter((step) => step.id !== "finalize").at(-1)!.id;

    return {
      step,
      nextStep,
      steps,
    };
  }, [selectedStep, requirements, wallet.connector?.type]);

  const setStep = useCallback((step: StepId): void => {
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
