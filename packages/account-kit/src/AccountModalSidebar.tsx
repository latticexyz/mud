import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export type Props = {
  activeStep: "connect" | "set-up" | "gas-tank" | "sign-in";
};

function StepNavItem({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return <div className={twMerge("p-5 text-white font-medium", isActive ? "bg-neutral-800" : null)}>{children}</div>;
}

export function AccountModalSidebar({ activeStep }: Props) {
  return (
    <nav className="flex flex-col divide-y divide-neutral-600 border-y border-neutral-600 -my-px leading-none">
      <StepNavItem isActive={activeStep === "connect"}>Connect wallet</StepNavItem>
      <StepNavItem isActive={activeStep === "set-up"}>Set up account</StepNavItem>
      <StepNavItem isActive={activeStep === "gas-tank"}>Fund gas tank</StepNavItem>
      <StepNavItem isActive={activeStep === "sign-in"}>Sign in to account</StepNavItem>
    </nav>
  );
}
