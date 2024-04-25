import { mudCoreConfig, MUDCoreUserConfig } from "@latticexyz/config";
import { ExtractUserTypes, StringForUnion } from "@latticexyz/common/type-utils";
import { MUDUserConfig } from "..";
import { ExpandMUDUserConfig } from "./typeExtensions";

/** mudCoreConfig wrapper to use generics in some options for better type inference */
export function mudConfig<
  T extends MUDCoreUserConfig,
  // (`never` is overridden by inference, so only the defined enums can be used by default)
  EnumNames extends StringForUnion = never,
  UserTypeNames extends StringForUnion = never,
  StaticUserTypes extends ExtractUserTypes<EnumNames | UserTypeNames> = ExtractUserTypes<EnumNames | UserTypeNames>
>(config: MUDUserConfig<T, EnumNames, UserTypeNames, StaticUserTypes>): ExpandMUDUserConfig<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mudCoreConfig(config) as any;
}
