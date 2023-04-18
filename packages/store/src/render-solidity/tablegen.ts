import path from "path";
import { StoreConfig } from "@latticexyz/config";
import { formatAndWriteSolidity } from "@latticexyz/common-codegen";
import { getTableOptions } from "./tableOptions.js";
import { renderTable } from "./renderTable.js";
import { renderTypesFromConfig } from "./renderTypesFromConfig.js";
import { renderTableIndex } from "./renderTableIndex.js";
import { rmSync } from "fs";

export async function tablegen(config: StoreConfig, outputBaseDirectory: string) {
  const allTableOptions = getTableOptions(config);

  const uniqueTableDirectories = new Set(allTableOptions.map(({ outputPath }) => path.dirname(outputPath)));
  for (const tableDir of uniqueTableDirectories) {
    rmSync(path.join(outputBaseDirectory, tableDir), { recursive: true, force: true });
  }

  // write tables to files
  for (const { outputPath, renderOptions } of allTableOptions) {
    const fullOutputPath = path.join(outputBaseDirectory, outputPath);
    const output = renderTable(renderOptions);
    formatAndWriteSolidity(output, fullOutputPath, "Generated table");
  }

  // write types to file
  if (Object.keys(config.enums).length > 0) {
    const fullOutputPath = path.join(outputBaseDirectory, `${config.userTypesPath}.sol`);
    const output = renderTypesFromConfig(config);
    formatAndWriteSolidity(output, fullOutputPath, "Generated types file");
  }

  const fullOutputPath = path.join(outputBaseDirectory, `Tables.sol`);
  const output = renderTableIndex(allTableOptions);
  formatAndWriteSolidity(output, fullOutputPath, "Generated table index");
}
