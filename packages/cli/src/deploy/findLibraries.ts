import { readFileSync } from "fs";
import { globSync } from "glob";
import { orderByDependencies } from "./orderByDependencies";
import { LinkReferences } from "../utils/findPlaceholders";

export function findLibraries(forgeOutDir: string): readonly {
  readonly path: string;
  readonly name: string;
}[] {
  const artifacts = globSync(`${forgeOutDir}/**/*.json`, { ignore: "**/*.abi.json", posix: true })
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
