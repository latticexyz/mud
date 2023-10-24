import { mudCoreConfig, MUDCoreUserConfig } from "@latticexyz/config";
import { ExtractUserTypes, StringForUnion } from "@latticexyz/common/type-utils";
import { MUDUserConfig } from "..";
import { ExpandMUDUserConfig } from "./typeExtensions";
import { parseConfig, ParseConfigOutput } from "../config/experimental/parseConfig";

/** mudCoreConfig wrapper to use generics in some options for better type inference */
export function mudConfig<
  T extends MUDCoreUserConfig,
  // (`never` is overridden by inference, so only the defined enums can be used by default)
  EnumNames extends StringForUnion = never,
  UserTypeNames extends StringForUnion = never,
  StaticUserTypes extends ExtractUserTypes<EnumNames | UserTypeNames> = ExtractUserTypes<EnumNames | UserTypeNames>
>(
  userConfig: MUDUserConfig<T, EnumNames, UserTypeNames, StaticUserTypes>
): ExpandMUDUserConfig<T> & {
  parsedConfig: ParseConfigOutput<{ [enumName in EnumNames]: "uint8" }, ExpandMUDUserConfig<T>>;
} {
  const config = mudCoreConfig(userConfig) as MUDUserConfig<T, EnumNames, UserTypeNames, StaticUserTypes>;
  const parsedConfig = parseConfig(config);
  return {
    ...config,
    parsedConfig,
  };
}
