import { Arguments, CommandBuilder } from "yargs";
import { execLog } from "../utils";
import chalk from "chalk";

type Options = {
  name: string;
  template: string;
};

export const command = "create <name>";
export const desc = "Sets up a mud project into <name>. Requires yarn.";

export const deprecated = true;

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      template: { type: "string", desc: "Template to be used (available: [minimal, react])", default: "minimal" },
    })
    .positional("name", { type: "string", default: "mud-app" });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { name, template } = argv;
  console.log(chalk.red.bold("⚠️  This command will be removed soon. Use `yarn create mud` instead."));

  const result = await execLog("yarn", ["create", "mud", name, "--template", template]);
  if (result.exitCode != 0) process.exit(result.exitCode);

  process.exit(0);
};
