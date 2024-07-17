import { isHex } from "viem";
import { getSystemContracts } from "./getSystemContracts";
import { System, World } from "../config/v2";
import { resolveSystem } from "../config/v2/system";

export type ResolvedSystem = System & {
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
      const systemConfig = config.systems[contract.name] ?? resolveSystem({ label: contract.name });
      return {
        ...systemConfig,
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
