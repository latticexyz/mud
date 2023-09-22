import path from "path";
import { formatAndWriteSolidity, loadAndExtractUserTypes } from "@latticexyz/common/codegen";
import { getTableOptions } from "./tableOptions";
import { renderTable } from "./renderTable";
import { renderTypesFromConfig } from "./renderTypesFromConfig";
import { renderTableIndex } from "./renderTableIndex";
import { rmSync } from "fs";
import { StoreConfig } from "../config";

export async function tablegen(config: StoreConfig, outputBaseDirectory: string, remappings: [string, string][]) {
  const solidityUserTypes = loadAndExtractUserTypes(config.userTypes, outputBaseDirectory, remappings);
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
