import { AccountKitGlobal } from "../embed/common";

declare global {
  interface Window {
    AccountKit?: AccountKitGlobal;
  }
}

export const AccountKit = new Proxy({} as AccountKitGlobal, {
  get(target, key) {
    if (!window.AccountKit) {
      throw new Error(
        // TODO: include script URL here for easier copy+paste fix
        `Tried to use \`AccountKit.${String(key)}\`, but Account Kit was not found in this window. Did you include the <script> tag?`,
      );
    }
    return window.AccountKit[key as keyof AccountKitGlobal];
  },
});
