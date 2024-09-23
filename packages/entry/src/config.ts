import { satisfy } from "@ark/util";
import { Transport } from "viem";
import { Address } from "viem/accounts";

export type PaymasterType = "gasTank";
export type PaymasterBase = { readonly type: PaymasterType; readonly address: Address };

/**
 * @link http://www.npmjs.com/package/@latticexyz/gas-tank
 */
export type GasTankPaymaster = {
  readonly type: "gasTank";
  /**
   * Address of the `GasTank` paymaster. Defaults to `chain.contracts.gasTank.address` if set.
   * @link http://www.npmjs.com/package/@latticexyz/gas-tank
   */
  readonly address: Address;
};

export type Paymaster = satisfy<PaymasterBase, GasTankPaymaster>;

export type Erc4337Config = {
  /**
   * viem `Transport` for ERC-4337-specific RPC methods (e.g. `eth_sendUserOperation`).
   *
   * If not set, defaults to `http(chain.rpcUrls.erc4337Bundler.http[0])`.
   */
  readonly transport: Transport;
  /**
   * List of ERC-4337 paymasters.
   *
   * If not set, defaults to `gasTank` paymaster using `chain.contracts.gasTank.address`.
   */
  readonly paymasters: readonly [Paymaster, ...Paymaster[]];
};

export type Config = {
  /**
   * The chain ID where the world is deployed.
   * There must be a matching chain entry in wagmi's configured chains.
   * The app account client returned by MUD Entry will be tied to this chain.
   */
  readonly chainId: number;
  /*
   * The world address.
   */
  readonly worldAddress: Address;

  /**
   * MUD Entry UI theme.
   *
   * If not set, defaults to OS' light or dark mode.
   */
  theme?: "dark" | "light";

  readonly appInfo?: {
    /**
     * The app name.
     *
     * If not set, defaults to page's `<title>`.
     */
    readonly name?: string;
    /**
     * The URL of the app icon used throughout the onboarding process. It will be used as a fallback if no `image` is provided. Icon should be 1:1 aspect ratio, at least 200x200.
     *
     * If not set, defaults to the page's `<link rel="icon">` or the origin's `/favicon.ico`.
     */
    readonly icon?: string;
    /**
     * The URL of the splash image displayed during the first step of onboarding. Ideally around 600x250.
     *
     * If not set, defaults to displaying the name, icon, and origin.
     */
    readonly image?: string;
    /**
     * Optional URL to your app's Terms of Use. If set, the step before asking users to sign in to your app will link to this page.
     */
    readonly termsOfUse?: string;
    /**
     * Optional URL to your app's Privacy Policy. If set, the step before asking users to sign in to your app will link to this page.
     */
    readonly privacyPolicy?: string;
  };

  /**
   * Configuration for ERC-4337 compatible smart accounts.
   *
   * If not set, defaults to chain's `rpcUrls.erc4337Bundler` and `contracts.gasTank`.
   *
   * Set to `false` to opt out of smart accounts. The app signer will be used in its place and its balance treated as the gas tank.
   */
  readonly erc4337?: Erc4337Config | false;

  /**
   * Estimated gas per action in wei, used to calculate fees to abstract away ETH balance into number of "actions".
   *
   * Defaults to 500,000 wei.
   */
  readonly gasPerAction?: bigint;
  /**
   * Estimated calldata byte length per action, used to calculate fees to abstract away ETH balance into number of "actions".
   *
   * Defaults to 512 bytes.
   */
  readonly calldataPerAction?: number;
};
