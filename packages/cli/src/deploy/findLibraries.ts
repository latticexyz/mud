import { readFileSync } from "fs";
import { globSync } from "glob";
import { orderByDependencies } from "./orderByDependencies";
import { LinkReferences } from "../utils/findPlaceholders";

export function findLibraries(forgeOutDirs: string | string[]): readonly {
  readonly path: string;
  readonly name: string;
}[] {
  const dirs = Array.isArray(forgeOutDirs) ? forgeOutDirs : [forgeOutDirs];
  const globs = dirs.map((dir) => `${dir}/**/*.json`);
  const artifacts = globSync(globs, { ignore: "**/*.abi.json" })
    .sort()
    .map((path) => JSON.parse(readFileSync(path, "utf8")));

  const libraries = artifacts.flatMap((artifact) => {
    if (!artifact.metadata) return [];

    const contractPath = Object.keys(artifact.metadata.settings.compilationTarget)[0];
    const contractName = artifact.metadata.settings.compilationTarget[contractPath];
    const linkReferences = artifact.bytecode.linkReferences as LinkReferences;

    return Object.entries(linkReferences).flatMap(([libraryPath, reference]) =>
      Object.keys(reference).map((libraryName) => ({
        path: libraryPath,
        name: libraryName,
        dependentPath: contractPath,
        dependentName: contractName,
      })),
    );
  });

  return orderByDependencies(
    libraries,
    (lib) => `${lib.path}:${lib.name}`,
    (lib) => [`${lib.dependentPath}:${lib.dependentName}`],
  );
}
