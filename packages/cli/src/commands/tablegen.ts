import type { CommandModule } from "yargs";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { loadStoreConfig } from "../config/loadStoreConfig.js";
import { renderTablesFromConfig } from "../render-solidity/renderTablesFromConfig.js";
import { getSrcDirectory } from "../utils/foundry.js";
import { formatSolidity } from "../utils/format.js";
import { renderTypesFromConfig } from "../render-solidity/renderTypesFromConfig.js";

type Options = {
  configPath?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "tablegen",

  describe: "Autogenerate MUD Store table libraries based on the config file",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
    });
  },

  async handler({ configPath }) {
    const srcDir = await getSrcDirectory();

    const config = await loadStoreConfig(configPath);

    // render tables
    const renderedTables = renderTablesFromConfig(config);
    // write tables to files
    for (const { directory, output, tableName } of renderedTables) {
      const formattedOutput = await formatSolidity(output);

      const outputDirectory = path.join(srcDir, directory);
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

      const outputPath = path.join(srcDir, `${config.userTypes.path}.sol`);
      const outputDirectory = path.dirname(outputPath);
      mkdirSync(outputDirectory, { recursive: true });

      writeFileSync(outputPath, formattedOutput);
      console.log(`Generated types file: ${outputPath}`);
    }

    process.exit(0);
  },
};

export default commandModule;
