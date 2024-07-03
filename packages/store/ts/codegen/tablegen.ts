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
  const sourceDirectory = path.join(path.dirname(configPath), config.sourceDirectory);
  const configV1 = storeToV1(config);
  const solidityUserTypes = loadAndExtractUserTypes(
    configV1.userTypes,
    path.join(sourceDirectory, config.codegen.outputDirectory),
    remappings,
  );
  const tableOptions = getTableOptions({ configPath, config, solidityUserTypes });

  const tableDirs = Array.from(new Set(tableOptions.map(({ outputPath }) => path.dirname(outputPath))));
  await Promise.all(tableDirs.map((dir) => rm(dir, { recursive: true, force: true })));

  // write tables to files
  await Promise.all(
    tableOptions.map(async ({ outputPath, renderOptions }) => {
      const fullOutputPath = path.join(sourceDirectory, outputPath);
      const output = renderTable(renderOptions);
      await formatAndWriteSolidity(output, fullOutputPath, "Generated table");
    }),
  );

  // write table index
  if (tableOptions.length > 0 && config.codegen.indexFilename) {
    const fullOutputPath = path.join(sourceDirectory, config.codegen.outputDirectory, config.codegen.indexFilename);
    const output = renderTableIndex(tableOptions, path.relative(path.dirname(fullOutputPath), sourceDirectory));
    await formatAndWriteSolidity(output, fullOutputPath, "Generated table index");
  }

  // write types to file
  if (Object.keys(configV1.enums).length > 0) {
    const fullOutputPath = path.join(sourceDirectory, config.codegen.outputDirectory, config.codegen.userTypesFilename);
    const output = renderTypesFromConfig(configV1);
    await formatAndWriteSolidity(output, fullOutputPath, "Generated types file");
  }
}
