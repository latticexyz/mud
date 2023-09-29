import type { CommandModule } from "yargs";
import chalk from "chalk";
import { execa } from "execa";

type Options = {
  name: string | undefined;
  upper: boolean | undefined;
};

const commandModule: CommandModule<Options, Options> = {
  command: "zk",

  describe: "zk script",

  builder(yargs) {
    return yargs
      .options({
        upper: { type: "boolean" },
      })
      .positional("name", { type: "string", demandOption: true });
  },

  async handler({ name }) {
    const greeting = `Gm, ${name}!`;
    console.log(greeting);

    console.log(chalk.blue("Building with zk"));

    try {
      // Build with zk
      //navigate to the contracts folder
      process.chdir("packages/contracts");
      await execa("zkforge", ["zkbuild"], { stdio: "inherit" });

      console.log(chalk.green("zkbuild completed successfully!"));
    } catch (error) {
      console.error(chalk.red("zkbuild failed."));
      console.error(error);
    }

    process.exit(0);
  },
};

export default commandModule;
