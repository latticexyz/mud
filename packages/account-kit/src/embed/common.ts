import { Chain } from "wagmi/chains";
import { init } from "./init";
import { GetWagmiConfigOptions } from "../getWagmiConfig";
import { MountOptions } from "./mount";
import { MountButtonOptions } from "./mountButton";
import { CreateConfigParameters } from "wagmi";

export type AccountKitGlobal = {
  readonly getVersion: () => string;
  readonly getDefaultChains: () => readonly [Chain, ...Chain[]];
  readonly init: init;
};

export type AccountKitInstance = {
  getWagmiConfig(opts: GetWagmiConfigOptions): CreateConfigParameters;
  mount(opts?: Omit<MountOptions, "wagmiConfig" | "accountKitConfig" | "externalStore" | "internalStore">): () => void;
  mountButton(opts: Omit<MountButtonOptions, "internalStore">): () => void;
};
