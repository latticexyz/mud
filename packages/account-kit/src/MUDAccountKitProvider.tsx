import { createContext, useContext, type ReactNode } from "react";
import { Address } from "viem";
import { MUDChain } from "@latticexyz/common/chains";

export type Config = {
  readonly chain: MUDChain;
  readonly worldAddress: Address;
  readonly gasTankAddress: Address;
  readonly appInfo?: {
    readonly name?: string;
    /**
     * The app icon used throughout the onboarding process. It will be used as a fallback if no `image` is provided. Icon should be 1:1 aspect ratio, at least 200x200.
     */
    readonly icon?: string;
    /**
     * The image displayed during the first step of onboarding. Ideally around 600x250.
     */
    readonly image?: string;
  };
};

/** @internal */
const Context = createContext<Config | null>(null);

export type Props = {
  config: Config;
  children: ReactNode;
};

export function MUDAccountKitProvider({ config, children }: Props) {
  const currentConfig = useContext(Context);
  if (currentConfig) throw new Error("`MUDAccountKitProvider` can only be used once.");
  return <Context.Provider value={config}>{children}</Context.Provider>;
}

export function useConfig(): Config {
  const config = useContext(Context);
  if (!config) throw new Error("`useConfig` be used within a `MUDAccountKitProvider`.");
  return config;
}
