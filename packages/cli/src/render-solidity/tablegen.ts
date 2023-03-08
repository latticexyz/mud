import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { StoreConfig } from "../index.js";
import { formatSolidity } from "../utils/format.js";
import { renderTablesFromConfig } from "./renderTablesFromConfig.js";
import { renderTypesFromConfig } from "./renderTypesFromConfig.js";

export async function tablegen(config: StoreConfig, outputBaseDirectory: string) {
  // render tables
  const renderedTables = renderTablesFromConfig(config, outputBaseDirectory);
  // write tables to files
  for (const { outputDirectory, output, tableName } of renderedTables) {
    const formattedOutput = await formatSolidity(output);

    mkdirSync(outputDirectory, { recursive: true });

    const outputPath = path.join(outputDirectory, `${tableName}.sol`);
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
}
