import { Expanded, Config } from "./types";
import { zWorldConfig } from "./zod";

export function expandConfig<C extends Config>(config: C) {
  return zWorldConfig.parse(config) as Expanded<C>;
}
