import { AccountKitConfig, AccountKitGlobal, AccountKitGlobalProxy } from "./common";
import { version } from "./version";

declare global {
  interface Window {
    AccountKit?: AccountKitGlobal;
  }
}

export const AccountKit = new Proxy<AccountKitGlobalProxy>({} as AccountKitGlobalProxy, {
  get(target: unknown, key: keyof AccountKitGlobalProxy): AccountKitGlobalProxy[typeof key] {
    const AccountKit = window.AccountKit;
    if (!AccountKit) {
      throw new Error(
        // TODO: include script URL here for easier copy+paste fix
        `Tried to use \`AccountKit.${String(key)}\`, but Account Kit was not found in this window. Did you include the <script> tag?`,
      );
    }
    switch (key) {
      case "init":
        return (config: AccountKitConfig) => AccountKit.init(config, { proxyVersion: version });
      default:
        return AccountKit[key];
    }
  },
});
