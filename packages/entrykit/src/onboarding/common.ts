import { ReactNode } from "react";

export type Step = {
  id: string;
  isComplete: boolean;
  content: (props: {
    isActive: boolean;
    isExpanded: boolean;
    isFocused: boolean;
    setFocused: (isFocused: boolean) => void;
  }) => ReactNode;
};

export type RelayChain = {
  bridgeUrl: string;
};
export type RelayChains = {
  [chainId: number]: RelayChain | undefined;
};
