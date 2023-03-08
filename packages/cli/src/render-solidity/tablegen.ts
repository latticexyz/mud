import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { StoreConfig } from "../index.js";
import { formatSolidity } from "../utils/format.js";
import { getAllTableOptions } from "./tableOptions.js";
import { renderTable } from "./renderTable.js";
import { renderTypesFromConfig } from "./renderTypesFromConfig.js";
import { getAllPrototypeOptions } from "./prototypeOptions.js";
import { renderPrototype } from "./renderPrototype.js";

export async function tablegen(config: StoreConfig, outputBaseDirectory: string) {
  const allTableOptions = getAllTableOptions(config, outputBaseDirectory);
  // write tables to files
  for (const { outputDirectory, outputPath, renderOptions } of allTableOptions) {
    const output = renderTable(renderOptions);
    const formattedOutput = await formatSolidity(output);

    mkdirSync(outputDirectory, { recursive: true });

    writeFileSync(outputPath, formattedOutput);
    console.log(`Generated table: ${outputPath}`);
  }

  // render types
  if (Object.keys(config.userTypes.enums).length > 0) {
    const renderedTypes = renderTypesFromConfig(config);
    // write types to file
    const formattedOutput = await formatSolidity(renderedTypes);

    const outputPath = path.join(outputBaseDirectory, `${config.userTypes.path}.sol`);
    const outputDirectory = path.dirname(outputPath);
    mkdirSync(outputDirectory, { recursive: true });

    writeFileSync(outputPath, formattedOutput);
    console.log(`Generated types file: ${outputPath}`);
  }

  const allPrototypeOptions = getAllPrototypeOptions(config, allTableOptions, outputBaseDirectory);
  // write prototypes to files
  for (const { outputDirectory, prototypeName, renderOptions } of allPrototypeOptions) {
    const output = renderPrototype(renderOptions);
    const formattedOutput = await formatSolidity(output);

    mkdirSync(outputDirectory, { recursive: true });

    const outputPath = path.join(outputDirectory, `${prototypeName}.sol`);
    writeFileSync(outputPath, formattedOutput);
    console.log(`Generated prototype: ${outputPath}`);
  }
}
