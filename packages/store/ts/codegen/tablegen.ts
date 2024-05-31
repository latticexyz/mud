import path from "node:path";
import { formatAndWriteSolidity, loadAndExtractUserTypes } from "@latticexyz/common/codegen";
import { getTableOptions } from "./tableOptions";
import { renderTable } from "./renderTable";
import { renderTypesFromConfig } from "./renderTypesFromConfig";
import { renderTableIndex } from "./renderTableIndex";
import { rm } from "fs/promises";
import { Store as StoreConfig } from "../config/v2/output";
import { storeToV1 } from "../config/v2/compat";

export type TablegenOptions = {
  configPath: string;
  config: StoreConfig;
  remappings: [string, string][];
};

export async function tablegen({ configPath, config, remappings }: TablegenOptions) {
  const outputDirectory = path.join(path.dirname(configPath), config.sourceDirectory, config.codegen.outputDirectory);
  const configV1 = storeToV1(config);
  const solidityUserTypes = loadAndExtractUserTypes(configV1.userTypes, outputDirectory, remappings);
  const allTableOptions = getTableOptions(config, solidityUserTypes);

  const uniqueTableDirectories = Array.from(new Set(allTableOptions.map(({ outputPath }) => path.dirname(outputPath))));
  await Promise.all(
    uniqueTableDirectories.map(async (tableDir) => {
      await rm(path.join(outputDirectory, tableDir), { recursive: true, force: true });
    }),
  );

  // write tables to files
  await Promise.all(
    allTableOptions.map(async ({ outputPath, renderOptions }) => {
      const fullOutputPath = path.join(outputDirectory, outputPath);
      const output = renderTable(renderOptions);
      await formatAndWriteSolidity(output, fullOutputPath, "Generated table");
    }),
  );

  // write table index
  if (allTableOptions.length > 0 && configV1.codegenIndexFilename) {
    const fullOutputPath = path.join(outputDirectory, configV1.codegenIndexFilename);
    const output = renderTableIndex(allTableOptions);
    await formatAndWriteSolidity(output, fullOutputPath, "Generated table index");
  }

  // write types to file
  if (Object.keys(configV1.enums).length > 0) {
    const fullOutputPath = path.join(outputDirectory, configV1.userTypesFilename);
    const output = renderTypesFromConfig(configV1);
    await formatAndWriteSolidity(output, fullOutputPath, "Generated types file");
  }
}
