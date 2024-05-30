import { createWagmiConfig } from "../createWagmiConfig";
import { version } from "../../package.json";
import { AccountKit } from "./common";
import { mount } from "./mount";
import { mountButton } from "./mountButton";

console.log(`MUD Account Kit version ${version}`);

declare global {
  interface Window {
    AccountKit?: AccountKit;
  }
}

if (window.AccountKit) {
  const embeddedVersion = window.AccountKit.version;
  if (embeddedVersion !== version) {
    throw new Error(
      `Tried to embed Account Kit version ${version}, but this window already had version ${embeddedVersion} embedded.`,
    );
  }
} else {
  window.AccountKit = {
    version,
    createWagmiConfig,
    mount,
    mountButton,
  };
}
