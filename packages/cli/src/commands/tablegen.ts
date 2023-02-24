import type { CommandModule } from "yargs";
import { writeFileSync } from "fs";
import path from "path";
import { loadConfig } from "../utils/storeConfig";
import { renderTables } from "../utils/tablegen";
import { getSrcDirectory } from "../utils/forgeConfig";

type Options = {
  configPath?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "tablegen",

  describe: "TODO write description",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
    });
  },

  async handler({ configPath }) {
    const srcDir = await getSrcDirectory();

    const config = await loadConfig({ configPath });
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
