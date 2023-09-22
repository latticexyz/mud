import { readFileSync } from "fs";
import path from "path";
import { SolidityUserDefinedType, extractUserTypes } from "./extractUserTypes";

export function loadAndExtractUserTypes(
  userTypes: Record<string, string>,
  outputBaseDirectory: string
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
    const { filePath, data } = loadUserTypesFile(outputBaseDirectory, unresolvedFilePath);
    extractedUserTypes = Object.assign(userTypes, extractUserTypes(data, userTypeNames, filePath));
  }
  return extractedUserTypes;
}

function loadUserTypesFile(
  outputBaseDirectory: string,
  unresolvedFilePath: string
): {
  filePath: string;
  data: string;
} {
  if (unresolvedFilePath.indexOf(".") === 0) {
    return {
      filePath: path.relative(outputBaseDirectory, unresolvedFilePath),
      data: readFileSync(unresolvedFilePath, "utf8"),
    };
  } else {
    // TODO support remappings
    return {
      filePath: unresolvedFilePath,
      data: readFileSync(path.join("node_modules", unresolvedFilePath), "utf8"),
    };
  }
}
