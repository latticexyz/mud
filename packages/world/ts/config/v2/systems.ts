import { mapObject } from "@latticexyz/common/utils";
import { SYSTEM_DEFAULTS } from "../defaults";
import { SystemsInput } from "./input";
import { mergeIfUndefined } from "@latticexyz/store/config/v2";

export type resolveSystems<systems extends SystemsInput> = {
  [system in keyof systems]: mergeIfUndefined<systems[system], typeof SYSTEM_DEFAULTS>;
};

export function resolveSystems<systems extends SystemsInput>(systems: systems): resolveSystems<systems> {
  return mapObject(systems, (system) => mergeIfUndefined(system, SYSTEM_DEFAULTS));
}
