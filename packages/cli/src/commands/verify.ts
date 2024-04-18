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
import { Hex } from "viem";
import { MUDError } from "@latticexyz/common/errors";

type Options = {
  worldAddress?: string;
  configPath?: string;
  profile?: string;
  srcDir?: string;
  verifier?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "verify",

  describe: "Verify contracts",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the MUD config file" },
      profile: { type: "string", desc: "The foundry profile to use" },
      worldAddress: { type: "string", desc: "Verify an existing World at the given address" },
      srcDir: { type: "string", desc: "Source directory. Defaults to foundry src directory." },
      verifier: { type: "string", desc: "The verifier to use" },
      verifierUrl: {
        type: "string",
        desc: "The verification provider.",
      },
    });
  },

  async handler(opts) {
    if (!opts.worldAddress) {
      throw new MUDError("Need a world address");
    }

    const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;

    const configV2 = (await loadConfig(opts.configPath)) as WorldConfig;
    const config = worldToV1(configV2);

    const srcDir = opts.srcDir ?? (await getSrcDirectory(profile));
    const outDir = await getOutDirectory(profile);

    const contractNames = getExistingContracts(srcDir).map(({ basename }) => basename);
    const resolvedWorldConfig = resolveWorldConfig(config, contractNames);

    const systems = Object.keys(resolvedWorldConfig.systems).map((name) => {
      const contractData = getContractData(`${name}.sol`, name, outDir);

      return {
        name,
        bytecode: contractData.bytecode,
      };
    });

    const modules = config.modules.map((mod) => {
      const contractData =
        defaultModuleContracts.find((defaultMod) => defaultMod.name === mod.name) ??
        getContractData(`${mod.name}.sol`, mod.name, outDir);

      return {
        name: mod.name,
        bytecode: contractData.bytecode,
      };
    });

    // Wrap in try/catch, because yargs seems to swallow errors
    try {
      await verify({
        foundryProfile: profile,
        systems,
        modules,
        worldAddress: opts.worldAddress as Hex,
        verifier: opts.verifier,
        verifierUrl: opts.verifierUrl,
      });
    } catch (error) {
      logError(error);
      process.exit(1);
    }
    process.exit(0);
  },
};

export default commandModule;
