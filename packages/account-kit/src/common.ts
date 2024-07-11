import { Chain } from "wagmi/chains";
import { MountOptions } from "./global/mount";
import { MountButtonOptions } from "./global/mountButton";
import { CreateConfigParameters } from "wagmi";
import { Config } from "./core/config";
import { ExternalStore } from "./global/createExternalStore";

// TODO: add some way to define wallets (abstraction over connectors)
export type AccountKitConfig = Config & {
  /**
   * List of chains used for things like depositing funds. Must include the chain corresponding to the app's `chainId` and any chains you expect to bridge from.
   *
   * Defaults to the list returned by `getDefaultChains()`. You can use this helper to add or remove chains.
   * This is helpful in development if you run your local node on a different port or with a different chain ID.
   *
   * ```
   * const chains = [foundry, ...AccountKit.getDefaultChains()];
   * const accountKit = AccountKit.init({ chains });
   * ```
   */
  // TODO: use own chain object/shape so we can get things like icon URL, bundler URL
  chains?: CreateConfigParameters["chains"];
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
   *
   * @internal This is set automatically by the Account Kit SDK and is for internal use only.
   */
  proxyVersion?: string;
};

export type AccountKitGlobal = {
  /**
   * Get the version of this embedded Account Kit SDK, which may differ from your Account Kit SDK dependency.
   */
  readonly getVersion: () => string;
  /**
   * Get the default chains used by Account Kit. Useful if you want to extend these with your own before calling `AccountKit.init`.
   */
  readonly getDefaultChains: () => readonly [Chain, ...Chain[]];
  /**
   * Create a new Account Kit instance.
   */
  readonly init: (config: AccountKitConfig, internal?: AccountKitInternalOptions) => AccountKitInstance;
};

export type AccountKitGlobalProxy = AccountKitGlobal;

export type AccountKitInstance = {
  readonly getWagmiConfig: () => CreateConfigParameters;
  readonly mount: (
    opts?: Omit<MountOptions, "wagmiConfig" | "accountKitConfig" | "externalStore" | "internalStore">,
  ) => () => void;
  readonly mountButton: (opts: Omit<MountButtonOptions, "internalStore">) => () => void;
  // TODO: use `ReadonlyExternalStore` once supported by `useStore` (https://github.com/pmndrs/zustand/discussions/2581)
  readonly store: ExternalStore;
};
