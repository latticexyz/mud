import { MUDChain } from "@latticexyz/common/chains";
import { satisfy } from "@latticexyz/common/type-utils";
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
   * The chain the world is deployed to. This is the chain used to return an app account client once fully signed in.
   */
  readonly chain: MUDChain;
  /*
   * The world address.
   */
  readonly worldAddress: Address;

  /**
   * Account Kit UI theme.
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
     * The app icon used throughout the onboarding process. It will be used as a fallback if no `image` is provided. Icon should be 1:1 aspect ratio, at least 200x200.
     *
     * If not set, defaults to the page's `<link rel="icon">` or the origin's `/favicon.ico`.
     */
    readonly icon?: string;
    /**
     * The splash image displayed during the first step of onboarding. Ideally around 600x250.
     *
     * If not set, defaults to displaying the name, icon, and origin.
     */
    readonly image?: string;
  };

  readonly erc4337?: Erc4337Config | false;
};
