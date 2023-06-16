import { renderEnums } from "@latticexyz/common/codegen";
import { StoreConfig } from "../config";

export function renderTypesFromConfig(config: StoreConfig) {
  const enums = Object.keys(config.enums).map((name) => ({
    name,
    memberNames: config.enums[name],
  }));

  return renderEnums(enums);
}
