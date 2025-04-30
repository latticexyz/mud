import { ReactNode } from "react";

export type Step = {
  id: string;
  isComplete: boolean;
  content: (props: { isActive: boolean; isExpanded: boolean }) => ReactNode;
};

export type RelayChain = {
  bridgeUrl: string;
};
export type RelayChains = {
  [chainId: number]: RelayChain | undefined;
};
