import { ReactNode } from "react";
import { parseEther } from "viem";

export type Step = {
  id: string;
  isComplete: boolean;
  content: (props: { isActive: boolean; isExpanded: boolean }) => ReactNode;
};

export const minGasBalance = parseEther("0.01");

export type RelayChain = {
  bridgeUrl: string;
};
export type RelayChains = {
  [chainId: number]: RelayChain | undefined;
};
