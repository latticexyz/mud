import fs from "node:fs/promises";
import path from "node:path";
import { formatAndWriteSolidity, contractToInterface, type ImportDatum } from "@latticexyz/common/codegen";
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
  const outDir = path.join(
    rootDir,
    config.sourceDirectory,
    config.codegen.outputDirectory,
    config.codegen.worldgenDirectory,
  );

  if (clean) {
    await fs.rm(outDir, { recursive: true, force: true });
  }

  const outputPath = path.join(outDir, config.codegen.worldInterfaceName + ".sol");

  const systems = (await resolveSystems({ rootDir, config }))
    // TODO: move to codegen option or generate "system manifest" and codegen from that
    .filter((system) => system.deploy.registerWorldFunctions)
    .map((system) => {
      const interfaceName = `I${system.label}`;
      return {
        ...system,
        interfaceName,
        interfacePath: path.join(path.dirname(outputPath), `${interfaceName}.sol`),
      };
    });

  const worldImports = systems.map(
    (system): ImportDatum => ({
      symbol: system.interfaceName,
      path: "./" + path.relative(path.dirname(outputPath), system.interfacePath),
    }),
  );

  await Promise.all(
    systems.map(async (system) => {
      const source = await fs.readFile(path.join(rootDir, system.sourcePath), "utf8");
      // get external functions from a contract
      const { functions, errors, symbolImports } = contractToInterface(source, system.label);
      const imports = symbolImports.map(
        ({ symbol, path: importPath }): ImportDatum => ({
          symbol,
          path: importPath.startsWith(".")
            ? "./" + path.relative(outDir, path.join(rootDir, path.dirname(system.sourcePath), importPath))
            : importPath,
        }),
      );
      const output = renderSystemInterface({
        name: system.interfaceName,
        functionPrefix: system.namespace === "" ? "" : `${system.namespace}__`,
        functions,
        errors,
        imports,
      });
      // write to file
      await formatAndWriteSolidity(output, system.interfacePath, "Generated system interface");
    }),
  );

  // render IWorld
  const output = renderWorldInterface({
    interfaceName: config.codegen.worldInterfaceName,
    imports: worldImports,
    storeImportPath: config.codegen.storeImportPath.startsWith(".")
      ? "./" + path.relative(path.dirname(outputPath), path.join(rootDir, config.codegen.storeImportPath))
      : config.codegen.storeImportPath,
    worldImportPath: config.codegen.worldImportPath.startsWith(".")
      ? "./" + path.relative(path.dirname(outputPath), path.join(rootDir, config.codegen.worldImportPath))
      : config.codegen.worldImportPath,
  });
  // write to file
  await formatAndWriteSolidity(output, outputPath, "Generated world interface");
}
