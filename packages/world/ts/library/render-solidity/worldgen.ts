import { readFileSync } from "fs";
import path from "path";
import { formatAndWriteSolidity, contractToInterface, type RelativeImportDatum } from "@latticexyz/common/codegen";
import { StoreConfig } from "@latticexyz/store";
import { renderSystemInterface } from "./renderSystemInterface";
import { renderWorld } from "./renderWorld";
import { resolveWorldConfig, WorldConfig } from "../config";

export async function worldgen(
  config: StoreConfig & WorldConfig,
  existingContracts: { path: string; basename: string }[],
  outputBaseDirectory: string
) {
  const resolvedConfig = resolveWorldConfig(
    config,
    existingContracts.map(({ basename }) => basename)
  );

  const worldgenBaseDirectory = path.join(outputBaseDirectory, config.worldgenDirectory);
  const systems = existingContracts.filter(({ basename }) => Object.keys(resolvedConfig.systems).includes(basename));

  const systemInterfaceImports: RelativeImportDatum[] = [];
  for (const system of systems) {
    const data = readFileSync(system.path, "utf8");
    // get external funcions from a contract
    const { functions, errors, symbolImports } = contractToInterface(data, system.basename);
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
    const { name } = resolvedConfig.systems[system.basename];
    const output = renderSystemInterface({
      name: systemInterfaceName,
      functionPrefix: config.namespace === "" ? "" : `${config.namespace}_${name}_`,
      functions,
      errors,
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
