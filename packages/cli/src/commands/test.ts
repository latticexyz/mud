import type { CommandModule } from "yargs";
import { execLog, generateLibDeploy, resetLibDeploy } from "../utils/index.js";
import { getTestDirectory } from "../utils/forgeConfig";

type Options = {
  forgeOpts?: string;
  config: string;
  v: number;
};

const commandModule: CommandModule<Options, Options> = {
  command: "test",

  describe: "Run contract tests",

  builder(yargs) {
    return yargs.options({
      forgeOpts: { type: "string", desc: "Options passed to `forge test` command" },
      config: { type: "string", default: "./deploy.json", desc: "Component and system deployment configuration" },
      v: { type: "number", default: 2, desc: "Verbosity for forge test" },
    });
  },

  async handler({ forgeOpts, config, v }) {
    const testDir = await getTestDirectory();

    // Generate LibDeploy.sol
    console.log("Generate LibDeploy.sol");
    await generateLibDeploy(config, testDir);

    // Call forge test
    const child = execLog("forge", [
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
  },
};

export default commandModule;
