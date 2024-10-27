import { Transport } from "viem";
import { Address } from "viem/accounts";

// TODO: rethink smart account config options

export type EntryKitConfig = {
  /**
   * The chain ID where the world is deployed.
   * There must be a matching chain entry in wagmi's configured chains.
   * The session client returned by EntryKit will be tied to this chain.
   */
  readonly chainId: number;
  /**
   * The world address.
   */
  readonly worldAddress: Address;

  readonly walletConnectProjectId: string;

  // TODO: move these to chain config
  readonly bundlerTransport: Transport;
  // currently assumes quarry paymaster
  readonly paymasterAddress: Address;
  // currently assumes quarry paymaster pass issuer service
  // TODO: add rpc types
  readonly passIssuerTransport: Transport;
  readonly explorerUrl?: string;

  /**
   * EntryKit UI theme.
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
};
