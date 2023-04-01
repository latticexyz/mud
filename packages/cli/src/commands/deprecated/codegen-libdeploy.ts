import type { CommandModule } from "yargs";
import { generateLibDeploy } from "../../utils/deprecated/index.js";

type Options = {
  config: string;
  out: string;
  systems?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "codegen-libdeploy",

  describe: "Generate LibDeploy.sol from given deploy config",

  builder(yargs) {
    return yargs.options({
      config: { type: "string", default: "./deploy.json", desc: "Component and system deployment configuration" },
      out: { type: "string", default: ".", desc: "Output directory for LibDeploy.sol" },
      systems: { type: "string", desc: "Only generate deploy code for the given systems" },
    });
  },

  async handler({ config, out, systems }) {
    await generateLibDeploy(config, out, systems);
    process.exit(0);
  },
};

export default commandModule;
