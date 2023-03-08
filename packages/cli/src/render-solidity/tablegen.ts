import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { StoreConfig } from "../index.js";
import { formatSolidity } from "../utils/format.js";
import { getTableOptions } from "./tableOptions.js";
import { renderTable } from "./renderTable.js";
import { renderTypesFromConfig } from "./renderTypesFromConfig.js";
import { getPrototypeOptions } from "./prototypeOptions.js";
import { renderPrototype } from "./renderPrototype.js";

export async function tablegen(config: StoreConfig, outputBaseDirectory: string) {
  const allTableOptions = getTableOptions(config);
  // write tables to files
  for (const { outputPath, renderOptions } of allTableOptions) {
    const fullOutputPath = path.join(outputBaseDirectory, outputPath);
    const output = renderTable(renderOptions);
    formatAndWrite(output, fullOutputPath, "Generated table");
  }

  // write types to file
  if (Object.keys(config.userTypes.enums).length > 0) {
    const fullOutputPath = path.join(outputBaseDirectory, `${config.userTypes.path}.sol`);
    const output = renderTypesFromConfig(config);
    formatAndWrite(output, fullOutputPath, "Generated types file");
  }

  const allPrototypeOptions = getPrototypeOptions(config, allTableOptions);
  // write prototypes to files
  for (const { outputPath, renderOptions } of allPrototypeOptions) {
    const fullOutputPath = path.join(outputBaseDirectory, outputPath);
    const output = renderPrototype(renderOptions);
    formatAndWrite(output, fullOutputPath, "Generated prototype");
  }
}

async function formatAndWrite(output: string, fullOutputPath: string, logPrefix: string) {
  const formattedOutput = await formatSolidity(output);

  mkdirSync(path.dirname(fullOutputPath), { recursive: true });

  writeFileSync(fullOutputPath, formattedOutput);
  console.log(`${logPrefix}: ${fullOutputPath}`);
}
