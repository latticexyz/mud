import type { CommandModule } from "yargs";
import { logError } from "../utils/errors";
import { DeployOptions, deployOpts, runDeploy } from "../runDeploy";

const commandModule: CommandModule<typeof deployOpts, DeployOptions> = {
  command: "deploy",

  describe: "Deploy MUD contracts",

  builder(yargs) {
    return yargs.options(deployOpts);
  },

  async handler(opts) {
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
