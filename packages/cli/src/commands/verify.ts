import type { CommandModule } from "yargs";
import { verify } from "../verify";
import { logError } from "../utils/errors";
import { loadConfig } from "@latticexyz/config/node";
import { WorldConfig, resolveWorldConfig } from "@latticexyz/world/internal";
import { worldToV1 } from "@latticexyz/world/config/v2";
import { getOutDirectory, getSrcDirectory } from "@latticexyz/common/foundry";
import { getExistingContracts } from "../utils/getExistingContracts";
import { getContractData } from "../utils/getContractData";

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

  async handler({ profile }) {
    const configV2 = (await loadConfig(undefined)) as WorldConfig;
    const config = worldToV1(configV2);

    const srcDir = await getSrcDirectory(profile);
    const outDir = await getOutDirectory(profile);

    const forgeSourceDir = srcDir;
    const contractNames = getExistingContracts(forgeSourceDir).map(({ basename }) => basename);

    const resolvedWorldConfig = resolveWorldConfig(config, contractNames);
    const systems = Object.keys(resolvedWorldConfig.systems).map((systemName) => {
      const contractData = getContractData(`${systemName}.sol`, systemName, outDir);

      return {
        systemName,
        bytecode: contractData.bytecode,
      };
    });

    console.log(systems);

    // Wrap in try/catch, because yargs seems to swallow errors
    try {
      await verify({
        foundryProfile: profile,
        systems,
      });
    } catch (error) {
      logError(error);
      process.exit(1);
    }
    process.exit(0);
  },
};

export default commandModule;
