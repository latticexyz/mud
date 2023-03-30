import { StoreConfig } from "../config/parseStoreConfig.js";
import { renderTypes } from "./renderTypes.js";

export function renderTypesFromConfig(config: StoreConfig) {
  const enums = Object.keys(config.enums).map((name) => ({
    name,
    memberNames: config.enums[name],
  }));

  return renderTypes({
    enums,
  });
}
