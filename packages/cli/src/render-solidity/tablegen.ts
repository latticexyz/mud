import path from "path";
import { StoreConfig } from "../config/index.js";
import { getTableOptions } from "./tableOptions.js";
import { renderTable } from "./renderTable.js";
import { renderTypesFromConfig } from "./renderTypesFromConfig.js";
import { formatAndWriteSolidity } from "../utils/formatAndWrite.js";
import { tsgen } from "../render-ts/tsgen.js";

export async function tablegen(config: StoreConfig, outputBaseDirectory: string) {
  const allTableOptions = getTableOptions(config);
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

  // TODO this should be a plugin
  // generate typescript definitions
  if (config.recsGenerate) {
    tsgen(config);
  }
}
