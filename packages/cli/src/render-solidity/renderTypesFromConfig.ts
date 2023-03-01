import { StoreConfig } from "../config/parseStoreConfig.js";
import { renderTypes } from "./renderTypes.js";

export function renderTypesFromConfig(config: StoreConfig) {
  const enums = Object.keys(config.userTypes.enums).map((name) => ({
    name,
    memberNames: config.userTypes.enums[name],
  }));

  return renderTypes({
    enums,
  });
}
