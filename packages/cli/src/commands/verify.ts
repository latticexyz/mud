import type { CommandModule } from "yargs";
import { logError } from "../utils/errors";
import { runVerify, VerifyOptions, verifyOptions } from "../runVerify";

const commandModule: CommandModule<typeof verifyOptions, VerifyOptions> = {
  command: "verify",

  describe: "Verify MUD contracts",

  builder(yargs) {
    return yargs.options(verifyOptions);
  },

  async handler(opts) {
    // Wrap in try/catch, because yargs seems to swallow errors
    try {
      await runVerify(opts);
    } catch (error) {
      logError(error);
      process.exit(1);
    }
    process.exit(0);
  },
};

export default commandModule;
