import { AccountKitGlobal } from "../common";
import { version } from "../../package.json";
import { defaultChains } from "../core/defaultChains";
import { init } from "./init";
import { createPostMessageAccount } from "../isolated-signer/postMessageAccount";

console.log(`MUD Account Kit version ${version}`);

declare global {
  interface Window {
    AccountKit?: AccountKitGlobal;
  }
}

if (window.AccountKit) {
  const embeddedVersion = window.AccountKit.getVersion();
  if (embeddedVersion !== version) {
    throw new Error(
      `Tried to embed Account Kit version ${version}, but this window already had version ${embeddedVersion} embedded.`,
    );
  }
} else {
  window.AccountKit = Object.freeze({
    getVersion() {
      return version;
    },
    getDefaultChains() {
      return defaultChains;
    },
    init,
  });
}

createPostMessageAccount().then(async (account) => {
  console.log("got account", account);
  console.log("signed", await account.signMessage({ message: "hello" }));
});
