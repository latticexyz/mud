import { readFileSync } from "fs";
import path from "path";
import { MUDConfig } from "@latticexyz/config";
import { formatAndWriteSolidity, contractToInterface, type RelativeImportDatum } from "@latticexyz/common/codegen";
import { renderSystemInterface } from "./renderSystemInterface";
import { renderWorld } from "./renderWorld";

export async function worldgen(
  config: MUDConfig,
  existingContracts: { path: string; basename: string }[],
  outputBaseDirectory: string
) {
  const worldgenBaseDirectory = path.join(outputBaseDirectory, config.worldgenDirectory);
  const systems = existingContracts.filter(({ basename }) => Object.keys(config.systems).includes(basename));

  const systemInterfaceImports: RelativeImportDatum[] = [];
  for (const system of systems) {
    const data = readFileSync(system.path, "utf8");
    // get external funcions from a contract
    const { functions, symbolImports } = contractToInterface(data, system.basename);
    const imports = symbolImports.map((symbolImport) => {
      if (symbolImport.path[0] === ".") {
        // relative import
        return {
          symbol: symbolImport.symbol,
          fromPath: path.join(path.dirname(system.path), symbolImport.path),
          usedInPath: worldgenBaseDirectory,
        };
      } else {
        // absolute import
        return {
          symbol: symbolImport.symbol,
          path: symbolImport.path,
        };
      }
    });
    const systemInterfaceName = `I${system.basename}`;
    // create an interface using the external functions and imports
    const { name } = config.systems[system.basename];
    const output = renderSystemInterface({
      name: systemInterfaceName,
      functionPrefix: config.namespace === "" ? "" : `${config.namespace}_${name}_`,
      functions,
      imports,
    });
    // write to file
    const fullOutputPath = path.join(worldgenBaseDirectory, systemInterfaceName + ".sol");
    await formatAndWriteSolidity(output, fullOutputPath, "Generated system interface");

    // prepare imports for IWorld
    systemInterfaceImports.push({
      symbol: systemInterfaceName,
      fromPath: `${systemInterfaceName}.sol`,
      usedInPath: "./",
    });
  }

  // render IWorld
  const output = renderWorld({
    interfaceName: config.worldInterfaceName,
    imports: systemInterfaceImports,
    storeImportPath: config.storeImportPath,
    worldImportPath: config.worldImportPath,
  });
  // write to file
  const fullOutputPath = path.join(worldgenBaseDirectory, config.worldInterfaceName + ".sol");
  await formatAndWriteSolidity(output, fullOutputPath, "Generated system interface");
}
