import {
  renderArguments,
  renderedSolidityHeader,
  renderAbsoluteImports,
  renderRelativeImports,
  type AbsoluteImportDatum,
} from "@latticexyz/common/codegen";
import type { RenderWorldOptions } from "./types";

export function renderWorld(options: RenderWorldOptions) {
  const { interfaceName, storeImportPath, worldImportPath, imports } = options;
  const baseImports: AbsoluteImportDatum[] =
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

${renderAbsoluteImports(baseImports)}

${renderRelativeImports(imports)}

/**
 * The ${interfaceName} interface includes all systems dynamically added to the World
 * during the deploy process.
 */
interface ${interfaceName} is ${renderArguments(importSymbols)} {

}

`;
}
