import { readFileSync } from "fs";
import { globSync } from "glob";
import { orderByDependencies } from "./orderByDependencies";
import { LinkReferences } from "../utils/findPlaceholders";

export function findLibraries(forgeOutDir: string): readonly {
  readonly path: string;
  readonly name: string;
  readonly dependents: { path: string; name: string }[];
}[] {
  const artifacts = globSync(`${forgeOutDir}/**/*.json`, { ignore: "**/*.abi.json" })
    .sort()
    .map((path) => JSON.parse(readFileSync(path, "utf8")));

  const librariesMap = new Map<string, { path: string; name: string; dependents: { path: string; name: string }[] }>();

  artifacts.forEach((artifact) => {
    if (!artifact.metadata) return;

    const contractPath = Object.keys(artifact.metadata.settings.compilationTarget)[0];
    const contractName = artifact.metadata.settings.compilationTarget[contractPath];
    const linkReferences = artifact.bytecode.linkReferences as LinkReferences;

    Object.entries(linkReferences).forEach(([libraryPath, reference]) => {
      Object.keys(reference).forEach((libraryName) => {
        const key = `${libraryPath}:${libraryName}`;
        if (!librariesMap.has(key)) {
          librariesMap.set(key, {
            path: libraryPath,
            name: libraryName,
            dependents: [],
          });
        }
        librariesMap.get(key)!.dependents.push({
          path: contractPath,
          name: contractName,
        });
      });
    });
  });

  const libraries = Array.from(librariesMap.values());

  return orderByDependencies(
    libraries,
    (lib) => `${lib.path}:${lib.name}`,
    (lib) => lib.dependents.map((dep) => `${dep.path}:${dep.name}`),
  );
}
