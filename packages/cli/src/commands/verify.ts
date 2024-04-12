import type { CommandModule } from "yargs";
import { verify } from "../verify";

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
    // verify contracts
    verify({ foundryProfile: profile });

    process.exit(0);
  },
};

export default commandModule;
