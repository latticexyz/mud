import { readFileSync } from "fs";
import { globSync } from "glob";
import { orderByDependencies } from "./orderByDependencies";
import { LinkReferences } from "../utils/findPlaceholders";
import { Library } from "./common";
import { getContractData } from "../utils/getContractData";
import { createPrepareDeploy } from "./createPrepareDeploy";
import path from "path";

export function findLibraries(forgeOutDirs: string | string[]): Library[] {
  const dirs = Array.isArray(forgeOutDirs) ? forgeOutDirs : [forgeOutDirs];

  // Deduplicate output directories and get all the artifacts
  const artifactsWithDirs = [...new Set(dirs)].flatMap((dir) => {
    const files = globSync(`${dir}/**/*.json`, { ignore: "/**/*.abi.json" }).sort();
    return files.map((filePath) => ({
      forgeOutDir: dir,
      artifact: JSON.parse(readFileSync(filePath, "utf8")),
    }));
  });

  const libraries = artifactsWithDirs.flatMap(({ artifact, forgeOutDir }) => {
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
        forgeOutDir,
      })),
    );
  });

  const orderedByDeps = orderByDependencies(
    libraries,
    (lib) => `${lib.path}:${lib.name}`,
    (lib) => [`${lib.dependentPath}:${lib.dependentName}`],
  );

  return orderedByDeps.map((library) => {
    const contractData = getContractData(path.basename(library.path), library.name, library.forgeOutDir);
    return {
      path: library.path,
      name: library.name,
      abi: contractData.abi,
      prepareDeploy: createPrepareDeploy(contractData.bytecode, contractData.placeholders),
      deployedBytecodeSize: contractData.deployedBytecodeSize,
    };
  });
}
