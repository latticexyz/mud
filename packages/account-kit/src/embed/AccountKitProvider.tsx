import { createContext, useContext, useEffect, type ReactNode } from "react";
import { propwiseXor, show } from "@arktype/util";
import { InitOptions } from "./init";
import { AccountKitInstance } from "./common";
import { AccountKit } from "./proxy";

/** @internal */
const Context = createContext<AccountKitInstance | null>(null);

export type Props = show<
  {
    children: ReactNode;
  } & propwiseXor<{ config: InitOptions }, { instance: AccountKitInstance }>
>;

export function AccountKitProvider({ config, instance, children }: Props) {
  const accountKit = instance ?? AccountKit.init(config);
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
