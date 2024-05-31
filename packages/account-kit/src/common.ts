import { Chain } from "wagmi/chains";
import { MountOptions } from "./global/mount";
import { MountButtonOptions } from "./global/mountButton";
import { CreateConfigParameters } from "wagmi";
import { Config } from "./core/config";

export type AccountKitConfig = Config & {
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

/**
 * @internal These are set automatically by the Account Kit SDK and are for internal use only.
 */
export type AccountKitInternalOptions = {
  /**
   * Package version of the `AccountKit` global proxy.
   *
   * We expect that the embedded global will be upgraded over time and its API may deviate slightly from the version that imports the global proxy.
   * By passing in the package version, we can ensure the embedded global can compensate for API changes by transforming its options, calls, etc. for backwards compatibility.
   */
  proxyVersion?: string;
};

export type AccountKitGlobal = {
  /** Get the version of this embedded Account Kit SDK, which may differ from your Account Kit SDK dependency. */
  readonly getVersion: () => string;
  /**
   * Get the default chains used by Account Kit. Useful if you want to extend these with your own.
   *
   * If you are passing these chains directly into Wagmi, provide the `wagmiVersion` imported from Wagmi.
   *
   * ```
   * import { version as wagmiVersion } from "wagmi";
   *
   * AccountKit.getDefaultChains({ wagmiVersion });
   * ```
   */
  readonly getDefaultChains: (opts?: { wagmiVersion?: string }) => readonly [Chain, ...Chain[]];
  readonly init: (config: AccountKitConfig) => AccountKitInstance;
};

export type AccountKitGlobalProxy = AccountKitGlobal;

export type AccountKitInstance = {
  readonly getWagmiConfig: (opts?: { wagmiVersion?: string }) => CreateConfigParameters;
  readonly mount: (
    opts?: Omit<MountOptions, "wagmiConfig" | "accountKitConfig" | "externalStore" | "internalStore">,
  ) => () => void;
  readonly mountButton: (opts: Omit<MountButtonOptions, "internalStore">) => () => void;
};
