import { BundlerClientConfig } from "viem/account-abstraction";
import { Address } from "viem/accounts";

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

  /**
   * EntryKit UI theme.
   *
   * If not set, defaults to OS' light or dark mode.
   */
  readonly theme?: "dark" | "light";

  /**
   * The app name.
   */
  readonly appName: string;
  /**
   * The URL of the app icon used throughout the onboarding process.
   * Icon should be 1:1 aspect ratio, at least 200x200.
   */
  readonly appIcon: string;

  /**
   * Custom paymaster client which overrides any paymaster address passed through the chain config.
   */
  readonly paymasterOverride?: BundlerClientConfig["paymaster"];
};
