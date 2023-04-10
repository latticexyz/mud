import { renderArguments, renderedSolidityHeader, renderImports } from "./common.js";
import { RenderWorldOptions } from "./types.js";

export function renderWorld(options: RenderWorldOptions) {
  const { interfaceName, storeImportPath, worldImportPath, imports } = options;

  // TODO rather than hardcode DynamicPartial, allow a custom interface as a config option?

  return `${renderedSolidityHeader}

import { IStore } from "${storeImportPath}IStore.sol";
import { IStoreDynamicPartial } from "${storeImportPath}IStoreDynamicPartial.sol";

import { IWorldCore } from "${worldImportPath}interfaces/IWorldCore.sol";
import { IWorldDynamicPartial } from "${worldImportPath}interfaces/IWorldDynamicPartial.sol";

${renderImports(imports)}

/**
 * The ${interfaceName} interface includes all systems dynamically added to the World
 * during the deploy process.
 */
interface ${interfaceName} is ${renderArguments([
    "IStore",
    "IStoreDynamicPartial",
    "IWorldCore",
    "IWorldDynamicPartial",
    ...imports.map(({ symbol }) => symbol),
  ])} {

}

`;
}
