import fs from "node:fs/promises";
import path from "node:path";
import { formatAndWriteSolidity, loadAndExtractUserTypes } from "@latticexyz/common/codegen";
import { getTableOptions } from "./tableOptions";
import { renderTable } from "./renderTable";
import { renderTypesFromConfig } from "./renderTypesFromConfig";
import { renderTableIndex } from "./renderTableIndex";
import { Store as StoreConfig } from "../config/v2/output";
import { mapObject } from "@latticexyz/common/utils";

export type TablegenOptions = {
  /**
   * MUD project root directory where all other relative paths are resolved from.
   */
  rootDir: string;
  config: StoreConfig;
  remappings: [string, string][];
};

export async function tablegen({ rootDir, config, remappings }: TablegenOptions) {
  const outputDirectory = path.join(rootDir, config.sourceDirectory, config.codegen.outputDirectory);
  const solidityUserTypes = loadAndExtractUserTypes(
    mapObject(config.userTypes, (type) => ({ ...type, internalType: type.type })),
    outputDirectory,
    remappings,
  );
  const allTableOptions = getTableOptions(config, solidityUserTypes);

  const uniqueTableDirectories = Array.from(new Set(allTableOptions.map(({ outputPath }) => path.dirname(outputPath))));
  await Promise.all(
    uniqueTableDirectories.map(async (tableDir) => {
      await fs.rm(path.join(outputDirectory, tableDir), { recursive: true, force: true });
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
  if (config.codegen.indexFilename !== false && allTableOptions.length > 0) {
    const fullOutputPath = path.join(outputDirectory, config.codegen.indexFilename);
    const output = renderTableIndex(allTableOptions);
    await formatAndWriteSolidity(output, fullOutputPath, "Generated table index");
  }

  // write types to file
  if (Object.keys(config.enums).length > 0) {
    const fullOutputPath = path.join(outputDirectory, config.codegen.userTypesFilename);
    const output = renderTypesFromConfig(config);
    await formatAndWriteSolidity(output, fullOutputPath, "Generated types file");
  }
}
