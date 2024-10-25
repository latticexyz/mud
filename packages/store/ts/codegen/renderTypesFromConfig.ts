import { renderEnums } from "@latticexyz/common/codegen";
import { Store } from "../config/v2/output";

/**
 * Renders Solidity code for enums defined in the provided config
 */
export function renderTypesFromConfig(config: Store) {
  return renderEnums(config.enums);
}
