import { renderEnums } from "@latticexyz/common/codegen";
import { MUDConfig } from "../config";

export function renderTypesFromConfig(config: MUDConfig) {
  const enums = Object.keys(config.enums).map((name) => ({
    name,
    memberNames: config.enums[name],
  }));

  return renderEnums(enums);
}
