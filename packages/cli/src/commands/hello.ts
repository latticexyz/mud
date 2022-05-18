import type { Arguments, CommandBuilder } from "yargs";

type Options = {
  name: string;
  upper: boolean | undefined;
};

export const command = "hello <name>";
export const desc = "Greet <name> with Hello";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      upper: { type: "boolean" },
    })
    .positional("name", { type: "string", demandOption: true });

export const handler = (argv: Arguments<Options>): void => {
  const { name, upper } = argv;
  const greeting = `Hello, ${name}!`;
  process.stdout.write(upper ? greeting.toUpperCase() : greeting);
  process.exit(0);
};
