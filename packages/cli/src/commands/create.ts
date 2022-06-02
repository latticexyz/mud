import { Arguments, CommandBuilder } from "yargs";
import { exec } from "../utils";

type Options = {
  name: string;
};

export const command = "create <name>";
export const desc = "Sets up a fresh mud project into <name>. Requires yarn.";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.positional("name", { type: "string", demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { name } = argv;
  console.log("Creating new mud project in", name);

  console.log("Cloning...");
  await exec(`git clone https://github.com/latticexyz/mud _mudtemp`);

  console.log("Moving...");
  await exec(`cp -r _mudtemp/packages/ri ${name}`);

  console.log("Setting up vscode solidity settings...");
  await exec(`cp -r _mudtemp/.vscode ${name}/.vscode`);

  console.log("Cleaning up...");
  await exec(`rm -rf _mudtemp`);

  console.log("Setting up package.json...");
  await exec(`mv ${name}/packagejson.template ${name}/package.json`);

  console.log("Installing dependencies using yarn...");
  await exec(`cd ${name} && yarn install`);

  console.log("Setting up foundry.toml...");
  await exec(`rm ${name}/contracts/foundry.toml`);
  await exec(`mv ${name}/contracts/foundrytoml.template ${name}/contracts/foundry.toml`);

  console.log("Setting up remappings...");
  await exec(`rm ${name}/contracts/remappings.txt`);
  await exec(`mv ${name}/contracts/remappingstxt.template ${name}/contracts/remappings.txt`);

  console.log("Setting up compile task...");
  await exec(`rm ${name}/contracts/tasks/compile.ts`);
  await exec(`mv ${name}/contracts/tasks/compilets.template ${name}/contracts/tasks/compile.ts`);

  console.log("Building contracts...");
  await exec(`cd ${name}/contracts && yarn build`);

  console.log("Done setting up! Run `yarn start` to start client and chain, then head to localhost:3000 to explore.");

  process.exit(0);
};
