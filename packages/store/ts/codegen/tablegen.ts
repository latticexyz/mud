import path from "path";
import { formatAndWriteSolidity, loadAndExtractUserTypes } from "@latticexyz/common/codegen";
import { getTableOptions } from "./tableOptions";
import { renderTable } from "./renderTable";
import { renderTypesFromConfig } from "./renderTypesFromConfig";
import { renderTableIndex } from "./renderTableIndex";
import { rm } from "fs/promises";
import { StoreConfig } from "../config";

export async function tablegen(config: StoreConfig, outputBaseDirectory: string, remappings: [string, string][]) {
  const solidityUserTypes = loadAndExtractUserTypes(config.userTypes, outputBaseDirectory, remappings);
  const allTableOptions = getTableOptions(config, solidityUserTypes);

  const uniqueTableDirectories = Array.from(new Set(allTableOptions.map(({ outputPath }) => path.dirname(outputPath))));
  await Promise.all(
    uniqueTableDirectories.map(async (tableDir) => {
      await rm(path.join(outputBaseDirectory, tableDir), { recursive: true, force: true });
    })
  );

  // write tables to files
  await Promise.all(
    allTableOptions.map(async ({ outputPath, renderOptions }) => {
      const fullOutputPath = path.join(outputBaseDirectory, outputPath);
      const output = renderTable(renderOptions);
      await formatAndWriteSolidity(output, fullOutputPath, "Generated table");
    })
  );

  // write table index
  if (allTableOptions.length > 0) {
    const fullOutputPath = path.join(outputBaseDirectory, config.codegenIndexFilename);
    const output = renderTableIndex(allTableOptions);
    await formatAndWriteSolidity(output, fullOutputPath, "Generated table index");
  }

  // write types to file
  if (Object.keys(config.enums).length > 0) {
    const fullOutputPath = path.join(outputBaseDirectory, config.userTypesFilename);
    const output = renderTypesFromConfig(config);
    await formatAndWriteSolidity(output, fullOutputPath, "Generated types file");
  }
}
