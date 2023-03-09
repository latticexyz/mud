import type { CommandModule } from "yargs";
import { execLog, generateLibDeploy, resetLibDeploy } from "../../utils/deprecated/index.js";
import { getTestDirectory } from "../../utils/foundry.js";

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

    process.on("SIGINT", async () => {
      console.log("\ngracefully shutting down from SIGINT (Crtl-C)");
      child.kill();
      await resetLibDeploy(testDir);
      process.exit();
    });

    await child;
    
    // Reset LibDeploy.sol
    console.log("Reset LibDeploy.sol");
    await resetLibDeploy(testDir);
  },
};

export default commandModule;
