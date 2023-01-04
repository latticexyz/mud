import { Arguments, CommandBuilder } from "yargs";
import { execLog } from "../utils";
import chalk from "chalk";

type Options = {
  name: string;
  template: string;
};

export const command = "create <name>";
export const desc = "Sets up a mud project into <name>. Requires yarn.";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      template: { type: "string", desc: "Template to be used (available: [minimal])", default: "minimal" },
    })
    .positional("name", { type: "string", default: "mud-app" });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { name, template } = argv;
  console.log(chalk.yellow.bold("Creating new mud project in", name));
  let result = await execLog("git", ["clone", `https://github.com/latticexyz/mud-template-${template}`, name]);
  if (result.exitCode != 0) process.exit(result.exitCode);

  console.log(chalk.yellow.bold("Installing dependencies..."));
  result = await execLog("yarn", ["--cwd", `./${name}`]);
  if (result.exitCode != 0) process.exit(result.exitCode);

  console.log(chalk.yellow.bold(`Done! Run \`yarn dev\` in ${name} to get started.`));
  process.exit(0);
};
