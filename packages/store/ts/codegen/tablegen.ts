import path from "path";
import { SolidityUserDefinedType, extractUserTypes, formatAndWriteSolidity } from "@latticexyz/common/codegen";
import { getTableOptions } from "./tableOptions";
import { renderTable } from "./renderTable";
import { renderTypesFromConfig } from "./renderTypesFromConfig";
import { renderTableIndex } from "./renderTableIndex";
import { readFileSync, rmSync } from "fs";
import { StoreConfig } from "../config";

export async function tablegen(config: StoreConfig, outputBaseDirectory: string) {
  const solidityUserTypes = loadAndExtractUserTypes(config.userTypes, outputBaseDirectory);
  const allTableOptions = getTableOptions(config, solidityUserTypes);

  const uniqueTableDirectories = new Set(allTableOptions.map(({ outputPath }) => path.dirname(outputPath)));
  for (const tableDir of uniqueTableDirectories) {
    rmSync(path.join(outputBaseDirectory, tableDir), { recursive: true, force: true });
  }

  // write tables to files
  for (const { outputPath, renderOptions } of allTableOptions) {
    const fullOutputPath = path.join(outputBaseDirectory, outputPath);
    const output = renderTable(renderOptions);
    await formatAndWriteSolidity(output, fullOutputPath, "Generated table");
  }

  // write types to file
  if (Object.keys(config.enums).length > 0) {
    const fullOutputPath = path.join(outputBaseDirectory, config.userTypesFilename);
    const output = renderTypesFromConfig(config);
    await formatAndWriteSolidity(output, fullOutputPath, "Generated types file");
  }

  const fullOutputPath = path.join(outputBaseDirectory, config.codegenIndexFilename);
  const output = renderTableIndex(allTableOptions);
  await formatAndWriteSolidity(output, fullOutputPath, "Generated table index");
}

function loadAndExtractUserTypes(userTypes: StoreConfig["userTypes"], outputBaseDirectory: string) {
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

function loadUserTypesFile(outputBaseDirectory: string, unresolvedFilePath: string) {
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
