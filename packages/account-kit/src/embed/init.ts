import { createConfig, type CreateConfigParameters } from "wagmi";
import { getWagmiConfig } from "../getWagmiConfig";
import { MountOptions, mount } from "./mount";
import { Config } from "../config";
import { MountButtonOptions, mountButton } from "./mountButton";
import { createInternalStore } from "./createInternalStore";
import { createExternalStore } from "./createExternalStore";

export type InitOptions = Config & {
  readonly wagmi?: {
    /**
     * Wagmi version used by the app/page where Account Kit is used.
     * You can get this via `import { version } from "wagmi"`.
     *
     * This is used to ensure that functions like `getWagmiConfig` return
     * backwards-compatible versions of the config to avoid potential runtime errors
     * as the Wagmi version that Account Kit's embedded script uses may differ from
     * the app/page using Account Kit.
     *
     * If not specified, no backwards compatibility check will be done.
     */
    readonly version?: string;
  } & Readonly<Partial<Pick<CreateConfigParameters, "chains" | "connectors" | "transports">>>;
};

export function init({ wagmi: { version: wagmiVersion, ...wagmiConfig } = {}, ...accountKitConfig }: InitOptions) {
  const externalStore = createExternalStore();
  const internalStore = createInternalStore();

  return Object.freeze({
    getWagmiConfig() {
      // TODO: transform config as-needed based on wagmiVersion
      wagmiVersion;
      return getWagmiConfig(wagmiConfig);
    },
    mount(opts: Omit<MountOptions, "wagmiConfig" | "accountKitConfig" | "externalStore" | "internalStore"> = {}) {
      return mount({
        ...opts,
        wagmiConfig: createConfig(getWagmiConfig(wagmiConfig)),
        accountKitConfig,
        externalStore,
        internalStore,
      });
    },
    mountButton(opts: Omit<MountButtonOptions, "internalStore">) {
      return mountButton({
        ...opts,
        internalStore,
      });
    },
  });
}

export type init = typeof init;
