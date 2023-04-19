import { StoreConfig } from "@latticexyz/config";
import { renderEnums } from "@latticexyz/common-codegen";

export function renderTypesFromConfig(config: StoreConfig) {
  const enums = Object.keys(config.enums).map((name) => ({
    name,
    memberNames: config.enums[name],
  }));

  return renderEnums(enums);
}
