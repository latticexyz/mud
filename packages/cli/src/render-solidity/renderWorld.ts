import { renderImports } from "./common.js";
import { renderArguments, renderedSolidityHeader, renderRelativeImports } from "./common.js";
import { ImportDatum, RenderWorldOptions } from "./types.js";

export function renderWorld(options: RenderWorldOptions) {
  const { interfaceName, storeImportPath, worldImportPath, imports } = options;
  const baseImports: ImportDatum[] =
    interfaceName === "IBaseWorld"
      ? [
          { symbol: "IStore", path: `${storeImportPath}IStore.sol` },
          { symbol: "IWorldKernel", path: `${worldImportPath}interfaces/IWorldKernel.sol` },
        ]
      : [
          {
            symbol: "IBaseWorld",
            path: `${worldImportPath}interfaces/IBaseWorld.sol`,
          },
        ];
  const importSymbols = [...baseImports, ...imports].map(({ symbol }) => symbol);

  return `${renderedSolidityHeader}

${renderImports(baseImports)}

${renderRelativeImports(imports)}

/**
 * The ${interfaceName} interface includes all systems dynamically added to the World
 * during the deploy process.
 */
interface ${interfaceName} is ${renderArguments(importSymbols)} {

}

`;
}
