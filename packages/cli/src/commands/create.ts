import { Arguments, CommandBuilder } from "yargs";
import { exec } from "../utils";

type Options = {
  name: string;
};

export const command = "create <name>";
export const desc = "Sets up a fresh mud project into <name>";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.positional("name", { type: "string", demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { name } = argv;
  console.log("Creating new mud project in", name);

  console.log("Cloning...");
  await exec(`git clone https://github.com/latticexyz/mud _mudtemp`);
  console.log("Done cloning");

  console.log("Moving...");
  await exec(`cp -r _mudtemp/packages/ri ${name}`);
  console.log("Done moving");

  console.log("Cleaning up...");
  await exec(`rm -rf _mudtemp`);
  console.log("Done cleaning up");

  process.exit(0);
};
