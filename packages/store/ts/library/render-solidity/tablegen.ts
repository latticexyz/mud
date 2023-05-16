import path from "path";
import { formatAndWriteSolidity } from "@latticexyz/common/codegen";
import { getTableOptions } from "./tableOptions";
import { renderTable } from "./renderTable";
import { renderTypesFromConfig } from "./renderTypesFromConfig";
import { renderTableIndex } from "./renderTableIndex";
import { rmSync } from "fs";
import { StoreConfig } from "../config";

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
    await formatAndWriteSolidity(output, fullOutputPath, "Generated table");
  }

  // write types to file
  if (Object.keys(config.enums).length > 0) {
    const fullOutputPath = path.join(outputBaseDirectory, `${config.userTypesPath}.sol`);
    const output = renderTypesFromConfig(config);
    await formatAndWriteSolidity(output, fullOutputPath, "Generated types file");
  }

  // solc expects `/` as path separator, but path.join uses `\` if the user is on Windows
  const fullOutputPath = path.join(outputBaseDirectory, `Tables.sol`).replace(/\\/g, "/");
  const output = renderTableIndex(allTableOptions);
  await formatAndWriteSolidity(output, fullOutputPath, "Generated table index");
}
