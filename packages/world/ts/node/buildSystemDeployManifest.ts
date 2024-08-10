import { mkdir, writeFile } from "node:fs/promises";
import { ResolvedSystem, resolveSystems } from "./resolveSystems";
import { World } from "../config/v2";
import { ContractArtifact, PendingBytecode, contractSizeLimit } from "./common";
import { findContractArtifacts } from "./findContractArtifacts";
import { getOutDirectory as getForgeOutDirectory } from "@latticexyz/common/foundry";
import path from "node:path";
import { getPendingBytecode } from "./getPendingBytecode";
import { Hex } from "viem";
import { getDependencies } from "./getDependencies";

export type SystemDeployManifest = {
  readonly systems: readonly {
    readonly systemId: Hex;
    readonly deployable: string;
  }[];
  readonly deployables: {
    readonly [id: string]: PendingBytecode;
  };
};

function getDeployableId(artifact: ContractArtifact): string {
  return `${artifact.sourcePath}:${artifact.name}`;
}

export async function buildSystemDeployManifest({
  rootDir,
  config,
}: {
  rootDir: string;
  config: World;
}): Promise<void> {
  const systems = await resolveSystems({ rootDir, config });

  // TODO: expose a `cwd` option to make sure this runs relative to `rootDir`
  const forgeOutDir = await getForgeOutDirectory();
  const contractArtifacts = await findContractArtifacts({ forgeOutDir });

  function getSystemArtifact(system: ResolvedSystem): ContractArtifact {
    const artifact = contractArtifacts.find((a) => a.sourcePath === system.sourcePath && a.name === system.label);
    if (!artifact) {
      throw new Error(
        `Could not find build artifact for system \`${system.label}\` at \`${system.sourcePath}\`. Did \`forge build\` run successfully?`,
      );
    }
    return artifact;
  }

  const deployableArtifacts = systems.flatMap((system) => {
    const artifact = getSystemArtifact(system);
    return [artifact, ...getDependencies(artifact, contractArtifacts)];
  });

  const deployables = Object.fromEntries(
    deployableArtifacts.map((artifact) => {
      if (artifact.deployedBytecodeSize > contractSizeLimit) {
        console.warn(
          // eslint-disable-next-line max-len
          `\nBytecode for \`${artifact.name}\` at \`${artifact.sourcePath}\` (${artifact.deployedBytecodeSize} bytes) is over the contract size limit (${contractSizeLimit} bytes). Run \`forge build --sizes\` for more info.\n`,
        );
      } else if (artifact.deployedBytecodeSize > contractSizeLimit * 0.95) {
        console.warn(
          // eslint-disable-next-line max-len
          `\nBytecode for \`${artifact.name}\` at \`${artifact.sourcePath}\` (${artifact.deployedBytecodeSize} bytes) is almost over the contract size limit (${contractSizeLimit} bytes). Run \`forge build --sizes\` for more info.\n`,
        );
      }

      return [getDeployableId(artifact), getPendingBytecode(artifact, contractArtifacts)];
    }),
  );

  const manifest = {
    systems: systems.map((system) => ({
      ...system,
      deployable: getDeployableId(getSystemArtifact(system)),
    })),
    deployables,
  } satisfies SystemDeployManifest;

  const outFile = path.join(rootDir, ".mud/pending/systems.json");
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(manifest, null, 2));
}
