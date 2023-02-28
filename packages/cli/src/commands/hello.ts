import type { CommandModule } from "yargs";

type Options = {
  name: string;
  upper: boolean | undefined;
};

const commandModule: CommandModule<Options, Options> = {
  command: "hello <name>",

  describe: "Greet <name> with Hello",

  builder(yargs) {
    return yargs
      .options({
        upper: { type: "boolean" },
      })
      .positional("name", { type: "string", demandOption: true });
  },

  handler({ name }) {
    const greeting = `Gm, ${name}!`;
    console.log(greeting);
    process.exit(0);
  },
};

export default commandModule;
