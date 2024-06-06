import { createConfig } from "wagmi";
import { getWagmiConfig } from "../core/getWagmiConfig";
import { MountOptions, mount } from "./mount";
import { MountButtonOptions, mountButton } from "./mountButton";
import { createInternalStore } from "./createInternalStore";
import { createExternalStore } from "./createExternalStore";
import { satisfy } from "@arktype/util";
import { AccountKitConfig, AccountKitGlobal, AccountKitInstance, AccountKitInternalOptions } from "../common";
import { version } from "../version";
import { debug } from "../debug";
import { freezeStore } from "./freezeStore";

export function init(
  { chains, ...accountKitConfig }: AccountKitConfig,
  { proxyVersion }: AccountKitInternalOptions = {},
): AccountKitInstance {
  // TODO: transform config as-needed based on proxyVersion
  debug("Creating Account Kit instance", { version, proxyVersion });

  const externalStore = createExternalStore();
  const internalStore = createInternalStore();

  const wagmiConfig = Object.freeze(getWagmiConfig({ chains }));

  return Object.freeze({
    getWagmiConfig: () => wagmiConfig,
    mount: (opts: Omit<MountOptions, "wagmiConfig" | "accountKitConfig" | "externalStore" | "internalStore"> = {}) => {
      return mount({
        ...opts,
        wagmiConfig: createConfig(wagmiConfig),
        accountKitConfig,
        externalStore,
        internalStore,
      });
    },
    mountButton: (opts: Omit<MountButtonOptions, "internalStore">) => {
      return mountButton({
        ...opts,
        internalStore,
      });
    },
    store: freezeStore(externalStore),
  });
}

export type init = satisfy<AccountKitGlobal["init"], typeof init>;
