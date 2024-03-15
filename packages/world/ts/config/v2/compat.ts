import { Config } from "./output";

export type configToV1<config> = config extends Config ? config : never;
