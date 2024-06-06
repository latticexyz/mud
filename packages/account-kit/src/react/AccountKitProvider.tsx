import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { propwiseXor, show } from "@arktype/util";
import { AccountKitConfig, AccountKitInstance } from "../common";
import { AccountKit } from "../proxy";

/** @internal */
const Context = createContext<AccountKitInstance | null>(null);

type InstanceOrConfig = propwiseXor<{ config: AccountKitConfig }, { instance: AccountKitInstance }>;

export type Props = show<
  InstanceOrConfig & {
    children: ReactNode;
  }
>;

export function AccountKitProvider({ config, instance, children }: Props) {
  const accountKit = useMemo(() => instance ?? AccountKit.init(config), [config, instance]);
  useEffect(() => {
    return accountKit.mount();
  }, [accountKit]);
  return <Context.Provider value={accountKit}>{children}</Context.Provider>;
}

export function useAccountKitInstance(): AccountKitInstance {
  const instance = useContext(Context);
  if (!instance) throw new Error("`useAccountKitInstance` can only be used within a `AccountKitProvider`.");
  return instance;
}
