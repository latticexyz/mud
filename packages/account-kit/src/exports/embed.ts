import { CreateConfigParameters } from "wagmi";
import { CreateWagmiConfigOptions } from "../createWagmiConfig";
import { AccountKit } from "../embed/common";

declare global {
  interface Window {
    AccountKit?: AccountKit;
  }
}

// TODO: consider returning a proxy and doing this dynamically? then we can also use `AccountKit.version` where `AccountKit` is checked at call time rather than import time

export function createWagmiConfig(opts: CreateWagmiConfigOptions): CreateConfigParameters {
  if (!window.AccountKit) {
    throw new Error(
      // TODO: include script URL here for easier copy+paste fix
      "Tried to use `createWagmiConfig`, but Account Kit was not found in this window. Did you include the <script> tag?",
    );
  }
  return window.AccountKit.createWagmiConfig(opts);
}
