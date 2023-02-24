import type { CommandModule } from "yargs";
import { writeFileSync } from "fs";
import path from "path";
import { loadStoreConfig } from "../config/loadStoreConfig.js";
import { renderTables } from "../utils/tablegen.js";
import { getSrcDirectory } from "../utils/forgeConfig.js";

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
    const renderedTables = renderTables(config);

    for (const { output, tableName } of renderedTables) {
      const basePath = config.tables[tableName].path;
      const outputPath = path.join(srcDir, basePath, `${tableName}.sol`);
      writeFileSync(outputPath, output);
      console.log(`Generated schema: ${outputPath}`);
    }

    process.exit(0);
  },
};

export default commandModule;
