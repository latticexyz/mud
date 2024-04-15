import type { CommandModule } from "yargs";
import { verify } from "../verify";
import { logError } from "../utils/errors";

type Options = {
  profile?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "verify",

  describe: "Verify contracts",

  builder(yargs) {
    return yargs.options({
      profile: { type: "string", desc: "The foundry profile to use" },
    });
  },

  async handler({ profile }) {
    // Wrap in try/catch, because yargs seems to swallow errors
    try {
      await verify({ foundryProfile: profile });
    } catch (error) {
      logError(error);
      process.exit(1);
    }
    process.exit(0);
  },
};

export default commandModule;
