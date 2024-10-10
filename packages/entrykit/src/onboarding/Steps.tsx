import { Step } from "./common";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export type Props = {
  steps: Step[];
};

export function Steps({ steps }: Props) {
  if (!steps.length) throw new Error("No steps.");

  const [selectedStepId, setSelectedStepId] = useState<null | string>(null);
  const nextStep = steps.find((step) => step.canComplete && !step.isComplete);
  const activeStep =
    (selectedStepId != null ? steps.find((step) => step.id === selectedStepId) : null) ??
    nextStep ??
    steps.filter((step) => step.isComplete).at(-1) ??
    steps.at(-1)!;

  return (
    <>
      <div className="flex items-center justify-center p-2">
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            title={step.label}
            className="outline-none p-2.5 -my-2.5 hover:enabled:brightness-125 transition"
            onClick={() => setSelectedStepId(step.id)}
          >
            <span
              className={twMerge(
                "block w-2.5 h-2.5 rounded-full",
                step.id === nextStep?.id ? "bg-orange-500" : step.isComplete ? "bg-amber-700" : "bg-gray-300",
                step.id === activeStep.id ? "ring-4 ring-orange-500/20" : null,
              )}
            ></span>
            <span className="sr-only">{step.label}</span>
          </button>
        ))}
      </div>

      <div className="outline-none flex-grow flex flex-col">{activeStep.content}</div>
    </>
  );
}
