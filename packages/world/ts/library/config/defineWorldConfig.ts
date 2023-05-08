import { Config } from "./types";

export function defineWorldConfig<C extends Config>(config: C): C {
  return config;
}
