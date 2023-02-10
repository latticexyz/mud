import type { Arguments, CommandBuilder } from "yargs";
import { execLog, generateLibDeploy, resetLibDeploy } from "../utils";
import { getTestDir } from "../utils/forgeConfig";

type Options = {
  forgeOpts?: string;
  config: string;
  v: number;
};

export const command = "test";
export const desc = "Run contract tests";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    forgeOpts: { type: "string", desc: "Options passed to `forge test` command" },
    config: { type: "string", default: "./deploy.json", desc: "Component and system deployment configuration" },
    v: { type: "number", default: 2, desc: "Verbosity for forge test" },
  });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { forgeOpts, config, v } = argv;
  const testDir = await getTestDir();

  // Generate LibDeploy.sol
  console.log("Generate LibDeploy.sol");
  await generateLibDeploy(config, testDir);

  // Call forge test
  const { child } = await execLog("forge", [
    "test",
    ...(v ? ["-" + [...new Array(v)].map(() => "v").join("")] : []),
    ...(forgeOpts?.split(" ") || []),
  ]);

  // Reset LibDeploy.sol
  console.log("Reset LibDeploy.sol");
  await resetLibDeploy(testDir);

  process.on("SIGINT", () => {
    console.log("\ngracefully shutting down from SIGINT (Crtl-C)");
    child.kill();
    process.exit();
  });
};
