import { readFileSync } from "fs";
import path from "path";
import { MUDConfig } from "../index.js";
import { contractToInterface } from "../utils/contractToInterface.js";
import { formatAndWrite } from "../utils/formatAndWrite.js";
import { renderSystemInterface } from "./renderSystemInterface.js";
import { renderWorld } from "./renderWorld.js";
import { ImportDatum } from "./types.js";

export async function worldgen(
  config: MUDConfig,
  existingContracts: { path: string; basename: string }[],
  outputBaseDirectory: string
) {
  const worldgenBaseDirectory = path.join(outputBaseDirectory, config.worldgenDirectory);
  const systems = existingContracts.filter(({ basename }) => Object.keys(config.systems).includes(basename));

  const systemInterfaceImports: ImportDatum[] = [];
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
    const output = renderSystemInterface({
      name: systemInterfaceName,
      functionPrefix: config.namespace === "" ? "" : `${config.namespace}_${system.basename}_`,
      functions,
      imports,
    });
    // write to file
    const fullOutputPath = path.join(worldgenBaseDirectory, systemInterfaceName + ".sol");
    await formatAndWrite(output, fullOutputPath, "Generated system interface");

    // prepare imports for IWorld
    systemInterfaceImports.push({
      symbol: systemInterfaceName,
      fromPath: `${systemInterfaceName}.sol`,
      usedInPath: "./",
    });
  }

  // render IWorld
  const worldInterfaceName = "IWorld";
  const output = renderWorld({
    interfaceName: worldInterfaceName,
    imports: systemInterfaceImports,
    storeImportPath: config.storeImportPath,
    worldImportPath: config.worldImportPath,
  });
  // write to file
  const fullOutputPath = path.join(worldgenBaseDirectory, worldInterfaceName + ".sol");
  await formatAndWrite(output, fullOutputPath, "Generated system interface");
}
