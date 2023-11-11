import { readFile } from "fs/promises";
import { getCreate2Address, keccak256, stringToHex } from "viem";
import toposort from "toposort";
import glob from "glob";
import { LinkReferences, getContractData } from "../utils/utils/getContractData";
import { deployer } from "./ensureDeployer";
import { PublicLibrary, salt } from "./common";
import path from "path";

export async function getPublicLibraries(forgeOutDir: string) {
  const libraryDeps: {
    contractFullPath: string;
    libraryFullPath: string;
    libraryFilename: string;
    libraryName: string;
  }[] = [];
  const files = glob.sync(`${forgeOutDir}/**/*.json`, { ignore: "**/*.abi.json" });

  for (const contractFullPath of files) {
    const json = JSON.parse((await readFile(contractFullPath, "utf8")).trim());
    const linkReferences = json.bytecode.linkReferences as LinkReferences;

    for (const [libraryFullPath, namePositions] of Object.entries(linkReferences)) {
      const names = Object.keys(namePositions);
      for (const libraryName of names) {
        libraryDeps.push({
          contractFullPath,
          libraryFullPath,
          libraryFilename: path.basename(libraryFullPath),
          libraryName,
        });
      }
    }
  }

  const directedGraphEdges: [string, string][] = libraryDeps.map(({ contractFullPath, libraryFullPath }) => [
    libraryFullPath,
    contractFullPath,
  ]);
  const dependencyOrder = toposort(directedGraphEdges);

  const orderedLibraryDeps = libraryDeps.sort((a, b) => {
    return dependencyOrder.indexOf(a.libraryFullPath) - dependencyOrder.indexOf(b.libraryFullPath);
  });

  const libraries: PublicLibrary[] = [];
  for (const { libraryFullPath, libraryFilename, libraryName } of orderedLibraryDeps) {
    const { bytecode, abi } = getContractData(libraryFilename, libraryName, forgeOutDir, libraries);
    const address = getCreate2Address({ from: deployer, bytecode, salt });

    const fullyQualifiedName = `${libraryFullPath}:${libraryName}`;
    const hashPrefix = keccak256(stringToHex(fullyQualifiedName)).slice(2, 36);
    const addressPlaceholder = `__$${hashPrefix}$__`;

    libraries.push({
      address,
      bytecode,
      abi,
      fullyQualifiedName,
      filename: libraryFilename,
      name: libraryName,
      addressPlaceholder,
    });
  }

  return libraries;
}
