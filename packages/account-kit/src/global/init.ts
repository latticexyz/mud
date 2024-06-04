import { createConfig } from "wagmi";
import { getWagmiConfig } from "../core/getWagmiConfig";
import { MountOptions, mount } from "./mount";
import { MountButtonOptions, mountButton } from "./mountButton";
import { createInternalStore } from "./createInternalStore";
import { createExternalStore } from "./createExternalStore";
import { satisfy } from "@arktype/util";
import { AccountKitConfig, AccountKitGlobal, AccountKitInstance, AccountKitInternalOptions } from "../common";

export function init(
  { chains, ...config }: AccountKitConfig,
  { proxyVersion }: AccountKitInternalOptions = {},
): AccountKitInstance {
  // TODO: transform config as-needed based on proxyVersion
  proxyVersion;

  const externalStore = createExternalStore();
  const internalStore = createInternalStore();

  const wagmiConfig = Object.freeze(getWagmiConfig({ chains }));

  return Object.freeze({
    getWagmiConfig: () => wagmiConfig,
    mount: (opts: Omit<MountOptions, "wagmiConfig" | "accountKitConfig" | "externalStore" | "internalStore"> = {}) => {
      return mount({
        ...opts,
        wagmiConfig: createConfig(wagmiConfig),
        accountKitConfig: config,
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
  });
}

export type init = satisfy<AccountKitGlobal["init"], typeof init>;
