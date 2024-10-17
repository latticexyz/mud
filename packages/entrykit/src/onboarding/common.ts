import { ReactNode } from "react";
import { parseEther } from "viem";

export type Step = {
  id: string;
  label: string;
  isComplete: boolean;
  content: (props: { isActive: boolean; isExpanded: boolean }) => ReactNode;
};

export const minGasBalance = parseEther("0.01");
