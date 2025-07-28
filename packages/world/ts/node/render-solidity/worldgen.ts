import fs from "node:fs/promises";
import path from "node:path";
import {
  formatAndWriteSolidity,
  contractToInterface,
  createInheritanceResolver,
  applyTypeQualifiers,
  type ImportDatum,
} from "@latticexyz/common/codegen";
import { getRemappings } from "@latticexyz/common/foundry";
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
  // Get forge remappings for resolving npm packages
  const remappings = await getRemappings();
  const worldgenOutDir = path.join(
    rootDir,
    config.sourceDirectory,
    config.codegen.outputDirectory,
    config.codegen.worldgenDirectory,
  );

  const systems = (await resolveSystems({ rootDir, config }))
    // TODO: move to codegen option or generate "system manifest" and codegen from that
    .filter((system) => system.deploy.registerWorldFunctions || config.codegen.generateSystemLibraries)
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

  const worldImports = systems
    .filter((system) => system.deploy.registerWorldFunctions)
    .map(
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

      // Create inheritance resolver for this system
      const findInheritedSymbol = await createInheritanceResolver(
        path.join(rootDir, system.sourcePath),
        system.label,
        rootDir,
        remappings,
      );

      // get external functions from a contract
      let functions, errors, symbolImports, qualifiedSymbols;
      try {
        ({ functions, errors, symbolImports, qualifiedSymbols } = contractToInterface(
          source,
          system.label,
          findInheritedSymbol,
        ));
      } catch (error) {
        console.error(`Error parsing system ${system.label} at ${system.sourcePath}:`);
        console.error(error);
        throw error;
      }

      // Create type qualifiers map from qualified symbols
      const typeQualifiers = new Map<string, string>();
      for (const [symbol, qualified] of qualifiedSymbols) {
        if (qualified.qualifier) {
          typeQualifiers.set(symbol, `${qualified.qualifier}.${symbol}`);
        }
      }

      if (system.deploy.registerWorldFunctions) {
        const interfaceImports = symbolImports.map(
          ({ symbol, path: importPath }): ImportDatum => ({
            symbol,
            path: importPath.startsWith(".")
              ? "./" + path.relative(worldgenOutDir, path.join(rootDir, path.dirname(system.sourcePath), importPath))
              : importPath,
          }),
        );

        // Apply type qualifiers to functions and errors for the interface
        const qualifiedFunctions = functions.map((func) => ({
          ...func,
          parameters: applyTypeQualifiers(func.parameters, typeQualifiers),
          returnParameters: applyTypeQualifiers(func.returnParameters, typeQualifiers),
        }));

        const qualifiedErrors = errors.map((error) => ({
          ...error,
          parameters: applyTypeQualifiers(error.parameters, typeQualifiers),
        }));

        const systemInterface = renderSystemInterface({
          name: system.interfaceName,
          functionPrefix: system.namespace === "" ? "" : `${system.namespace}__`,
          functions: qualifiedFunctions,
          errors: qualifiedErrors,
          imports: interfaceImports,
        });
        // write to file
        await formatAndWriteSolidity(systemInterface, system.interfacePath, "Generated system interface");
      }

      if (config.codegen.generateSystemLibraries) {
        const systemImport = {
          symbol: system.label,
          path: "./" + path.relative(path.dirname(system.libraryPath), system.sourcePath),
        };

        const libraryImports = symbolImports.map(
          ({ symbol, path: importPath }): ImportDatum => ({
            symbol,
            path: importPath.startsWith(".")
              ? "./" +
                path.relative(
                  path.dirname(system.libraryPath),
                  path.join(rootDir, path.dirname(system.sourcePath), importPath),
                )
              : importPath,
          }),
        );

        const systemLibrary = renderSystemLibrary({
          libraryName: system.libraryName,
          interfaceName: system.interfaceName,
          systemLabel: system.label,
          systemName: system.name,
          namespace: system.namespace,
          resourceId: resourceToHex({ type: "system", namespace: system.namespace, name: system.name }),
          functions,
          errors,
          imports: [systemImport, ...libraryImports],
          storeImportPath,
          worldImportPath: config.codegen.worldImportPath.startsWith(".")
            ? "./" + path.relative(path.dirname(system.libraryPath), path.join(rootDir, config.codegen.worldImportPath))
            : config.codegen.worldImportPath,
          typeQualifiers,
        });
        // write to file
        await formatAndWriteSolidity(systemLibrary, system.libraryPath, "Generated system library");
      }
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
