import { readFileSync } from "fs";
import path from "path";
import { MUDConfig } from "@latticexyz/config";
import { contractToInterface } from "../utils/contractToInterface.js";
import { formatAndWriteSolidity } from "../utils/formatAndWrite.js";
import { renderSystemInterface } from "./renderSystemInterface.js";
import { renderWorld } from "./renderWorld.js";
import { RelativeImportDatum } from "./types.js";

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
    const { functions, symbols } = contractToInterface(data, system.basename);
    const imports = symbols.map((symbol) => ({
      symbol,
      fromPath: system.path,
      usedInPath: worldgenBaseDirectory,
    }));
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
