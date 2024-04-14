import type { CommandModule } from "yargs";
import { verify } from "../verify";
import { logError } from "../utils/errors";
import { Hex } from "viem";

type Options = {
  profile?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "verify",

  describe: "Verify contracts",

  builder(yargs) {
    return yargs.options({
      profile: { type: "string", desc: "The foundry profile to use" },
      worldAddress: { type: "string", desc: "Deploy to an existing World at the given address" },
    });
  },

  async handler({ profile, worldAddress }) {
    // Wrap in try/catch, because yargs seems to swallow errors
    try {
      await verify({ worldAddress: worldAddress as Hex, foundryProfile: profile });
    } catch (error) {
      logError(error);
      process.exit(1);
    }
    process.exit(0);
  },
};

export default commandModule;
