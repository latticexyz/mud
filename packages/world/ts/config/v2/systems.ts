import { mapObject } from "@latticexyz/common/utils";
import { SYSTEM_DEFAULTS } from "../defaults";
import { SystemsInput } from "./input";
import { mergeIfUndefined } from "@latticexyz/store/config/v2";

export type resolveSystems<systems extends SystemsInput> = {
  readonly [label in keyof systems]: mergeIfUndefined<systems[label], { name: label } & SYSTEM_DEFAULTS>;
};

export function resolveSystems<systems extends SystemsInput>(systems: systems): resolveSystems<systems> {
  return mapObject(systems, (system, label) => mergeIfUndefined(system, { name: label, ...SYSTEM_DEFAULTS }));
}
