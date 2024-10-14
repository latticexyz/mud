import { ReactNode } from "react";
import { parseEther } from "viem";

export type Step = {
  id: string;
  label: string;
  isComplete: boolean;
  content: null | ReactNode;
};

export const minGasBalance = parseEther(".25");
