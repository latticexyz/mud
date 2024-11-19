import fs from "node:fs/promises";
import path from "node:path";
import { formatAndWriteSolidity, contractToInterface, type ImportDatum } from "@latticexyz/common/codegen";
import { renderSystemInterface } from "./renderSystemInterface";
import { renderWorldInterface } from "./renderWorldInterface";
import { renderSystemLibrary } from "./renderSystemLibrary";
import { World as WorldConfig } from "../../config/v2/output";
import { resolveSystems } from "../resolveSystems";
import { resourceToHex } from "@latticexyz/common";

export async function worldgen({
  rootDir,
  config,
  clean = true,
}: {
  rootDir: string;
  config: WorldConfig;
  clean?: boolean;
}) {
  const worldgenOutDir = path.join(
    rootDir,
    config.sourceDirectory,
    config.codegen.outputDirectory,
    config.codegen.worldgenDirectory,
  );

  const systems = (await resolveSystems({ rootDir, config }))
    // TODO: move to codegen option or generate "system manifest" and codegen from that
    .filter((system) => system.deploy.registerWorldFunctions)
    .map((system) => {
      const interfaceName = `I${system.label}`;
      const libraryName = `${system.label}Lib`;

      const sourceDir = config.multipleNamespaces
        ? path.join(config.sourceDirectory, "namespaces", system.namespaceLabel)
        : config.sourceDirectory;

      const libraryOutDir = path.join(
        sourceDir,
        config.codegen.outputDirectory,
        config.codegen.systemLibrariesDirectory,
      );

      console.log(libraryOutDir);

      return {
        ...system,
        interfaceName,
        libraryName,
        interfacePath: path.join(worldgenOutDir, `${interfaceName}.sol`),
        libraryPath: path.join(libraryOutDir, `${libraryName}.sol`),
      };
    });

  if (clean) {
    const libraryDirs = [...new Set(systems.map(({ libraryPath }) => path.dirname(libraryPath)))];

    await Promise.all([
      fs.rm(worldgenOutDir, { recursive: true, force: true }),
      ...libraryDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })),
    ]);
  }

  const outputPath = path.join(worldgenOutDir, config.codegen.worldInterfaceName + ".sol");

  const worldImports = systems.map(
    (system): ImportDatum => ({
      symbol: system.interfaceName,
      path: "./" + path.relative(path.dirname(outputPath), system.interfacePath),
    }),
  );

  const storeImportPath = config.codegen.storeImportPath.startsWith(".")
    ? "./" + path.relative(path.dirname(outputPath), path.join(rootDir, config.codegen.storeImportPath))
    : config.codegen.storeImportPath;
  const worldImportPath = config.codegen.worldImportPath.startsWith(".")
    ? "./" + path.relative(path.dirname(outputPath), path.join(rootDir, config.codegen.worldImportPath))
    : config.codegen.worldImportPath;

  await Promise.all(
    systems.map(async (system) => {
      const source = await fs.readFile(path.join(rootDir, system.sourcePath), "utf8");
      // get external functions from a contract
      const { functions, errors, symbolImports } = contractToInterface(source, system.label);
      const imports = symbolImports.map(
        ({ symbol, path: importPath }): ImportDatum => ({
          symbol,
          path: importPath.startsWith(".")
            ? "./" + path.relative(worldgenOutDir, path.join(rootDir, path.dirname(system.sourcePath), importPath))
            : importPath,
        }),
      );
      const systemInterface = renderSystemInterface({
        name: system.interfaceName,
        functionPrefix: system.namespace === "" ? "" : `${system.namespace}__`,
        functions,
        errors,
        imports,
      });
      // write to file
      await formatAndWriteSolidity(systemInterface, system.interfacePath, "Generated system interface");

      const systemImport = {
        symbol: system.label,
        path: "./" + path.relative(path.dirname(system.libraryPath), system.sourcePath),
      };

      const systemLibrary = renderSystemLibrary({
        libraryName: system.libraryName,
        interfaceName: system.interfaceName,
        systemLabel: system.label,
        resourceId: resourceToHex({ type: "system", namespace: system.namespace, name: system.name }),
        functions,
        errors,
        // we know it's defined because we generated the map from the world imports
        imports: [systemImport, ...imports],
        storeImportPath,
        worldImportPath,
      });
      // write to file
      await formatAndWriteSolidity(systemLibrary, system.libraryPath, "Generated system library");
    }),
  );

  // render IWorld
  const output = renderWorldInterface({
    interfaceName: config.codegen.worldInterfaceName,
    imports: worldImports,
    storeImportPath,
    worldImportPath,
  });
  // write to file
  await formatAndWriteSolidity(output, outputPath, "Generated world interface");
}
