import type { CommandModule } from "yargs";
import { logError } from "../utils/errors";
import { DeployOptions, deployOptions, runDeploy } from "../runDeployZk";

const commandModule: CommandModule<typeof deployOptions, DeployOptions> = {
  command: "zk-deploy",

  describe: "Deploy MUD contracts on zkSync",

  builder(yargs) {
    return yargs.options(deployOptions);
  },

  async handler(opts) {
    console.log("zk-deploy");
    // Wrap in try/catch, because yargs seems to swallow errors
    try {
      await runDeploy(opts);
    } catch (error: any) {
      logError(error);
      process.exit(1);
    }
    process.exit(0);
  },
};

export default commandModule;
