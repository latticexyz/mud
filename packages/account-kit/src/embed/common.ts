import { createWagmiConfig } from "../createWagmiConfig";
import { mount } from "./mount";
import { mountButton } from "./mountButton";

export type AccountKit = {
  // TODO: move this to be `getVersion()` so its easier to override/compute version?
  version: string;
  createWagmiConfig: typeof createWagmiConfig;
  mount: typeof mount;
  mountButton: typeof mountButton;
};
