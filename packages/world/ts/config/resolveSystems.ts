import { isHex } from "viem";
import { getSystemContracts } from "../node";
import { System, World } from "./v2";
import { SYSTEM_DEFAULTS } from "./v2/defaults";

export type ResolvedSystem = System & {
  // TODO: move label into System config output
  readonly label: string;
  readonly sourcePath: string;
};

export async function resolveSystems({
  rootDir,
  config,
}: {
  rootDir: string;
  config: World;
}): Promise<readonly ResolvedSystem[]> {
  const systemContracts = await getSystemContracts({ rootDir, config });
  const contractNames = systemContracts.map((contract) => contract.name);

  // validate every system in config refers to an existing system contract
  const missingSystems = Object.keys(config.systems).filter((systemLabel) => !contractNames.includes(systemLabel));
  if (missingSystems.length > 0) {
    throw new Error(`Found systems in config with no corresponding system contract: ${missingSystems.join(", ")}`);
  }

  const systems = systemContracts
    .map((contract): ResolvedSystem => {
      // TODO: replace name with label
      const systemConfig = config.systems[contract.name] ?? { ...SYSTEM_DEFAULTS, name: contract.name };
      return {
        ...systemConfig,
        label: contract.name,
        sourcePath: contract.sourcePath,
      };
    })
    // TODO: replace `excludeSystems` with `deploy.disabled` or `codegen.disabled`
    .filter((system) => !config.excludeSystems.includes(system.label));

  const systemLabels = systems.map((system) => system.label);

  // validate every system has a valid access list
  for (const system of systems) {
    for (const accessListItem of system.accessList) {
      if (isHex(accessListItem)) continue;
      if (systemLabels.includes(accessListItem)) continue;
      throw new Error(
        `Access list item (${accessListItem}) for system (${system.label}) had no matching system contract.`,
      );
    }
  }

  return systems;
}
