import type { CommandModule } from "yargs";
import { execLog } from "../utils/index.js";
import chalk from "chalk";

type Options = {
  name: string;
  template: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "create <name>",

  deprecated: true,

  describe: "Sets up a mud project into <name>. Requires yarn.",

  builder(yargs) {
    return yargs
      .options({
        template: { type: "string", desc: "Template to be used (available: [minimal, react])", default: "minimal" },
      })
      .positional("name", { type: "string", default: "mud-app" });
  },

  async handler({ name, template }) {
    console.log(chalk.red.bold("⚠️  This command will be removed soon. Use `yarn create mud` instead."));

    const child = await execLog("yarn", ["create", "mud", name, "--template", template]);
    if (child.exitCode != 0) process.exit(child.exitCode);

    process.exit(0);
  },
};

export default commandModule;
