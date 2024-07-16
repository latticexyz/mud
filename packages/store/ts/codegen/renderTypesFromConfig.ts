import { renderEnums } from "@latticexyz/common/codegen";
import { Store } from "../config/v2";

/**
 * Renders Solidity code for enums defined in the provided config
 */
export function renderTypesFromConfig(config: Store) {
  return renderEnums(config.enums);
}
