import type { CommandModule } from "yargs";
import { writeFileSync } from "fs";
import path from "path";
import { loadStoreConfig } from "../config/loadStoreConfig.js";
import { renderTablesFromConfig } from "../render-table/index.js";
import { getSrcDirectory } from "../utils/forgeConfig.js";
import { formatSolidity } from "../utils/format.js";

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
    const renderedTables = renderTablesFromConfig(config);

    for (const { output, tableName } of renderedTables) {
      const formattedOutput = await formatSolidity(output);

      const tablePath = config.tables[tableName].route;
      const outputPath = path.join(srcDir, tablePath, `${tableName}.sol`);
      writeFileSync(outputPath, formattedOutput);
      console.log(`Generated schema: ${outputPath}`);
    }

    process.exit(0);
  },
};

export default commandModule;
