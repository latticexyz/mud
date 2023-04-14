import { renderArguments, renderedSolidityHeader, renderImports } from "./common.js";
import { RenderWorldOptions } from "./types.js";

export function renderWorld(options: RenderWorldOptions) {
  const { interfaceName, storeImportPath, worldImportPath, imports } = options;

  return `${renderedSolidityHeader}

import { IStoreRead } from "${storeImportPath}IStore.sol";

import { IWorldData } from "${worldImportPath}interfaces/IWorldData.sol";

${renderImports(imports)}

/**
 * The ${interfaceName} interface includes all systems dynamically added to the World
 * during the deploy process.
 */
interface ${interfaceName} is ${renderArguments(["IStoreRead", ...imports.map(({ symbol }) => symbol)])} {

}

`;
}
