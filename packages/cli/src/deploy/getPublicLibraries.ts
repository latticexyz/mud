import { readFile } from "fs/promises";
import { Address, getCreate2Address, keccak256, stringToHex } from "viem";
import toposort from "toposort";
import glob from "glob";
import { LinkReferences, getContractData } from "../utils/utils/getContractData";
import { PublicLibrary, salt } from "./common";
import path from "path";

export async function getPublicLibraries(forgeOutDir: string) {
  const libraryDeps: {
    libraryFilename: string;
    libraryName: string;
    contractFullyQualifiedName: string;
    libraryFullyQualifiedName: string;
  }[] = [];
  const files = glob.sync(`${forgeOutDir}/**/*.json`, { ignore: "**/*.abi.json" });

  for (const contractOutPath of files) {
    const json = JSON.parse((await readFile(contractOutPath, "utf8")).trim());
    const linkReferences = json.bytecode.linkReferences as LinkReferences;

    const contractFullPath = Object.keys(json.metadata.settings.compilationTarget)[0];
    // skip files that do not reference any contract/library
    if (!json.metadata) continue;
    const contractName = json.metadata.settings.compilationTarget[contractFullPath];

    for (const [libraryFullPath, namePositions] of Object.entries(linkReferences)) {
      const names = Object.keys(namePositions);
      for (const libraryName of names) {
        libraryDeps.push({
          libraryFilename: path.basename(libraryFullPath),
          libraryName,
          contractFullyQualifiedName: `${contractFullPath}:${contractName}`,
          libraryFullyQualifiedName: `${libraryFullPath}:${libraryName}`,
        });
      }
    }
  }

  const directedGraphEdges: [string, string][] = libraryDeps.map(
    ({ contractFullyQualifiedName, libraryFullyQualifiedName }) => [
      libraryFullyQualifiedName,
      contractFullyQualifiedName,
    ],
  );
  const dependencyOrder = toposort(directedGraphEdges);

  const orderedLibraryDeps = libraryDeps.sort((a, b) => {
    return dependencyOrder.indexOf(a.libraryFullyQualifiedName) - dependencyOrder.indexOf(b.libraryFullyQualifiedName);
  });

  const libraries: PublicLibrary[] = [];
  for (const { libraryFilename, libraryName, libraryFullyQualifiedName } of orderedLibraryDeps) {
    const { bytecode, abi, deployedBytecodeSize } = getContractData(
      libraryFilename,
      libraryName,
      forgeOutDir,
      libraries,
    );

    const hashPrefix = keccak256(stringToHex(libraryFullyQualifiedName)).slice(2, 36);
    const addressPlaceholder = `__$${hashPrefix}$__`;

    libraries.push({
      getAddress: (deployer: Address) => getCreate2Address({ from: deployer, bytecode: bytecode, salt }),
      bytecode,
      abi,
      deployedBytecodeSize,
      fullyQualifiedName: libraryFullyQualifiedName,
      filename: libraryFilename,
      name: libraryName,
      addressPlaceholder,
    });
  }

  return libraries;
}
