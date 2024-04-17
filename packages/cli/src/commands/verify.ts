import type { CommandModule } from "yargs";
import { verify } from "../verify";
import { logError } from "../utils/errors";
import { loadConfig } from "@latticexyz/config/node";
import { WorldConfig, resolveWorldConfig } from "@latticexyz/world/internal";
import { worldToV1 } from "@latticexyz/world/config/v2";
import { getOutDirectory, getSrcDirectory } from "@latticexyz/common/foundry";
import { getExistingContracts } from "../utils/getExistingContracts";
import { getContractData } from "../utils/getContractData";
import { defaultModuleContracts } from "../utils/defaultModuleContracts";

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
    const configV2 = (await loadConfig(undefined)) as WorldConfig;
    const config = worldToV1(configV2);

    const srcDir = await getSrcDirectory(profile);
    const outDir = await getOutDirectory(profile);

    const forgeSourceDir = srcDir;
    const contractNames = getExistingContracts(forgeSourceDir).map(({ basename }) => basename);

    const resolvedWorldConfig = resolveWorldConfig(config, contractNames);
    const systems = Object.keys(resolvedWorldConfig.systems).map((name) => {
      const contractData = getContractData(`${name}.sol`, name, outDir);

      return {
        label: name,
        bytecode: contractData.bytecode,
        deployedBytecodeSize: contractData.deployedBytecodeSize,
      };
    });

    const modules = config.modules.map((mod) => {
      const contractData =
        defaultModuleContracts.find((defaultMod) => defaultMod.name === mod.name) ??
        getContractData(`${mod.name}.sol`, mod.name, outDir);

      return {
        label: mod.name,
        bytecode: contractData.bytecode,
        deployedBytecodeSize: contractData.deployedBytecodeSize,
      };
    });

    // Wrap in try/catch, because yargs seems to swallow errors
    try {
      await verify({
        foundryProfile: profile,
        systems,
        modules,
      });
    } catch (error) {
      logError(error);
      process.exit(1);
    }
    process.exit(0);
  },
};

export default commandModule;
