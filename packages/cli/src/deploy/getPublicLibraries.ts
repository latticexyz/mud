import { readFile } from "fs/promises";
import { Address, Hex, getCreate2Address, keccak256, stringToHex } from "viem";
import glob from "glob";
import { LinkReferences, getContractData } from "../utils/utils/getContractData";
import { PublicLibrary, salt } from "./common";
import path from "path";
import { orderByDependencies } from "./orderByDependencies";

export async function getPublicLibraries(forgeOutDir: string, deployerAddress: Hex) {
  const libraryDeps: {
    libraryFilename: string;
    libraryName: string;
    contractFullyQualifiedName: string;
    libraryFullyQualifiedName: string;
  }[] = [];
  const files = glob.sync(`${forgeOutDir}/**/*.json`, { ignore: "**/*.abi.json" });

  for (const contractOutPath of files) {
    const json = JSON.parse((await readFile(contractOutPath, "utf8")).trim());
    console.log(contractOutPath, json);

    const linkReferences = json.bytecode.linkReferences as LinkReferences;

    // skip files that do not reference any contract/library
    if (!json.metadata) continue;
    console.log("contract", contractOutPath, json.metadata);
    const contractFullPath = Object.keys(json.metadata.settings.compilationTarget)[0];
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

  const orderedLibraryDeps = orderByDependencies(
    libraryDeps,
    (lib) => lib.libraryFullyQualifiedName,
    (lib) => [lib.contractFullyQualifiedName],
  );

  const libraries: PublicLibrary[] = [];
  for (const { libraryFilename, libraryName, libraryFullyQualifiedName } of orderedLibraryDeps) {
    const { bytecode, abi, deployedBytecodeSize } = getContractData(
      libraryFilename,
      libraryName,
      forgeOutDir,
      libraries,
      deployerAddress,
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
