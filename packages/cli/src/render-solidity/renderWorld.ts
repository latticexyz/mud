import { renderArguments, renderedSolidityHeader, renderImports } from "./common.js";
import { RenderWorldOptions } from "./types.js";

export function renderWorld(options: RenderWorldOptions) {
  const { interfaceName, storeImportPath, worldImportPath, imports } = options;

  return `${renderedSolidityHeader}

import { IStore } from "${storeImportPath}IStore.sol";

import { IWorldData } from "${worldImportPath}interfaces/IWorldData.sol";
import { IWorldAccess } from "${worldImportPath}interfaces/IWorldAccess.sol";

${renderImports(imports)}

/**
 * The ${interfaceName} interface includes all systems dynamically added to the World
 * during the deploy process.
 */
interface ${interfaceName} is ${renderArguments([
    "IStore",
    "IWorldData",
    "IWorldAccess",
    ...imports.map(({ symbol }) => symbol),
  ])} {

}

`;
}
