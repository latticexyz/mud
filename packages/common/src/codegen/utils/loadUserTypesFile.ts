import { readFileSync } from "fs";
import path from "path";
import { SolidityUserDefinedType, extractUserTypes } from "./extractUserTypes";
import { MUDError } from "../../errors";
import { SchemaAbiType } from "@latticexyz/schema-type/internal";

export type UserType = {
  filePath: string;
  internalType: SchemaAbiType;
};

/**
 * Load the user type files and extract type information from them.
 * @param userTypes record of user type data mapped by type names
 * @param outputBaseDirectory base path to the output directory
 * @param remappings solc remappings
 * @returns record of the user type information mapped by type names
 */
export function loadAndExtractUserTypes(
  userTypes: Record<string, UserType>,
  outputBaseDirectory: string,
  remappings: [string, string][],
): Record<string, SolidityUserDefinedType> {
  const userTypesPerFile: Record<string, string[]> = {};
  for (const [userTypeName, { filePath: unresolvedFilePath }] of Object.entries(userTypes)) {
    if (!(unresolvedFilePath in userTypesPerFile)) {
      userTypesPerFile[unresolvedFilePath] = [];
    }
    userTypesPerFile[unresolvedFilePath].push(userTypeName);
  }
  let extractedUserTypes: Record<string, SolidityUserDefinedType> = {};
  for (const [unresolvedFilePath, userTypeNames] of Object.entries(userTypesPerFile)) {
    const { filePath, data } = loadUserTypesFile(outputBaseDirectory, unresolvedFilePath, remappings);
    const userTypesInFile = extractUserTypes(data, userTypeNames, filePath);

    // Verify the actual user type matches the internalType specified in the config
    for (const [userTypeName, userType] of Object.entries(userTypesInFile)) {
      if (userType.internalTypeId !== userTypes[userTypeName].internalType) {
        throw new MUDError(
          `User type "${userTypeName}" has internal type "${userType.internalTypeId}" but config specifies "${userTypes[userTypeName].internalType}"`,
        );
      }
    }

    extractedUserTypes = { ...extractedUserTypes, ...userTypesInFile };
  }
  return extractedUserTypes;
}

function loadUserTypesFile(
  outputBaseDirectory: string,
  unresolvedFilePath: string,
  remappings: [string, string][],
): {
  filePath: string;
  data: string;
} {
  if (unresolvedFilePath.at(0) === ".") {
    const relativePath = path.relative(outputBaseDirectory, unresolvedFilePath);
    return {
      filePath: "./" + relativePath, // solc doesn't like relative paths without "./"
      data: readFileSync(unresolvedFilePath, "utf8"),
    };
  } else {
    // apply remappings to read the file via node
    let remappedFilePath = unresolvedFilePath;
    for (const [from, to] of remappings) {
      if (remappedFilePath.includes(from)) {
        remappedFilePath = remappedFilePath.replace(from, to);
        break;
      }
    }

    return {
      filePath: unresolvedFilePath,
      data: readFileSync(remappedFilePath, "utf8"),
    };
  }
}
