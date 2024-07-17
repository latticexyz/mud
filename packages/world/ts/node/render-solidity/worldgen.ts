import fs from "fs";
import path from "path";
import { formatAndWriteSolidity, contractToInterface, type RelativeImportDatum } from "@latticexyz/common/codegen";
import { renderSystemInterface } from "./renderSystemInterface";
import { renderWorldInterface } from "./renderWorldInterface";
import { World as WorldConfig } from "../../config/v2/output";
import { resolveSystems } from "../resolveSystems";

export async function worldgen({
  rootDir,
  config,
  clean = true,
}: {
  rootDir: string;
  config: WorldConfig;
  clean?: boolean;
}) {
  const outDir = path.join(config.sourceDirectory, config.codegen.outputDirectory, config.codegen.worldgenDirectory);

  if (clean) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  const systems = await resolveSystems({ rootDir, config });

  const systemInterfaceImports: RelativeImportDatum[] = [];
  for (const system of systems) {
    const data = fs.readFileSync(system.sourcePath, "utf8");
    // get external funcions from a contract
    const { functions, errors, symbolImports } = contractToInterface(data, system.label);
    const imports = symbolImports.map((symbolImport) => {
      if (symbolImport.path[0] === ".") {
        // relative import
        return {
          symbol: symbolImport.symbol,
          fromPath: path.join(path.dirname(system.sourcePath), symbolImport.path),
          usedInPath: outDir,
        };
      } else {
        // absolute import
        return {
          symbol: symbolImport.symbol,
          path: symbolImport.path,
        };
      }
    });
    const systemInterfaceName = `I${system.label}`;
    const output = renderSystemInterface({
      name: systemInterfaceName,
      functionPrefix: system.namespace === "" ? "" : `${system.namespace}__`,
      functions,
      errors,
      imports,
    });
    // write to file
    const fullOutputPath = path.join(rootDir, outDir, systemInterfaceName + ".sol");
    await formatAndWriteSolidity(output, fullOutputPath, "Generated system interface");

    // prepare imports for IWorld
    systemInterfaceImports.push({
      symbol: systemInterfaceName,
      fromPath: `${systemInterfaceName}.sol`,
      usedInPath: "./",
    });
  }

  // render IWorld
  const output = renderWorldInterface({
    interfaceName: config.codegen.worldInterfaceName,
    imports: systemInterfaceImports,
    storeImportPath: config.codegen.storeImportPath,
    worldImportPath: config.codegen.worldImportPath,
  });
  // write to file
  const fullOutputPath = path.join(rootDir, outDir, config.codegen.worldInterfaceName + ".sol");
  await formatAndWriteSolidity(output, fullOutputPath, "Generated world interface");
}
