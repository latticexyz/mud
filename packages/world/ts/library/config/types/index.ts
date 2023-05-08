import { WorldConfig, ExpandedWorldConfig } from "./world";

export * from "./world";
export * from "./modules";
export * from "./systems";

export type Config = WorldConfig;
export type Expanded<C extends Config> = ExpandedWorldConfig<C>;
