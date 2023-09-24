import { readFileSync } from "fs";
import path from "path";
import { SolidityUserDefinedType, extractUserTypes } from "./extractUserTypes";

export function loadAndExtractUserTypes(
  userTypes: Record<string, string>,
  outputBaseDirectory: string,
  remappings: [string, string][]
): Record<string, SolidityUserDefinedType> {
  const userTypesPerFile: Record<string, string[]> = {};
  for (const [userTypeName, unresolvedFilePath] of Object.entries(userTypes)) {
    if (!(unresolvedFilePath in userTypesPerFile)) {
      userTypesPerFile[unresolvedFilePath] = [];
    }
    userTypesPerFile[unresolvedFilePath].push(userTypeName);
  }
  let extractedUserTypes: Record<string, SolidityUserDefinedType> = {};
  for (const [unresolvedFilePath, userTypeNames] of Object.entries(userTypesPerFile)) {
    const { filePath, data } = loadUserTypesFile(outputBaseDirectory, unresolvedFilePath, remappings);
    extractedUserTypes = Object.assign(userTypes, extractUserTypes(data, userTypeNames, filePath));
  }
  return extractedUserTypes;
}

function loadUserTypesFile(
  outputBaseDirectory: string,
  unresolvedFilePath: string,
  remappings: [string, string][]
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
