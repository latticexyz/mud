import type { CommandModule } from "yargs";
import { deployHandler, DeployOptions } from "./deploy-v2.js";
import { yDeployOptions } from "./deploy-v2.js";

type Options = DeployOptions;

const commandModule: CommandModule<Options, Options> = {
  command: "test-v2",

  describe: "Run tests in MUD v2 contracts",

  builder(yargs) {
    return yargs.options({ ...yDeployOptions });
  },

  async handler(args) {
    // Deploy the contracts
    const deploymentInfo = await deployHandler({ ...args, saveDeployment: false });
    console.log("deployed to ", deploymentInfo.worldAddress);

    process.exit(0);
  },
};

export default commandModule;
