import { createContext, useContext, type ReactNode } from "react";
import { Address } from "viem";
import { MUDChain } from "@latticexyz/common/chains";
import { AccountModal } from "./AccountModal";

export type Config = {
  readonly chain: MUDChain;
  readonly worldAddress: Address;
  /**
   * Address of the `GasTank` paymaster. Defaults to `chain.contracts.gasTank.address` if set.
   * @link http://www.npmjs.com/package/@latticexyz/gas-tank
   */
  readonly gasTankAddress?: Address;
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
  theme?: "dark" | "light";
};

/** @internal */
const Context = createContext<Config | null>(null);

export type Props = {
  config: Config;
  children?: ReactNode;
};

export function AccountKitProvider({ config, children }: Props) {
  const currentConfig = useContext(Context);
  if (currentConfig) throw new Error("`AccountKitProvider` can only be used once.");
  return (
    <Context.Provider
      value={{
        ...config,
        gasTankAddress: config.gasTankAddress ?? config.chain.contracts?.gasTank?.address,
      }}
    >
      {children}
      <AccountModal />
    </Context.Provider>
  );
}

export function useConfig(): Config {
  const config = useContext(Context);
  if (!config) throw new Error("`useConfig` be used within a `AccountKitProvider`.");
  return config;
}
