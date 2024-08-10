import { mkdir, writeFile } from "node:fs/promises";
import { ResolvedSystem, resolveSystems } from "./resolveSystems";
import { World } from "../config/v2";
import { ContractArtifact, ReferenceIdentifier } from "./common";
import { findContractArtifacts } from "./findContractArtifacts";
import { getOutDirectory as getForgeOutDirectory } from "@latticexyz/common/foundry";
import path from "node:path";
import { Hex } from "viem";
import { getDependencies } from "./getDependencies";
import { referenceIdentifier } from "./types";

export type SystemDeployManifest = {
  readonly systems: readonly {
    readonly systemId: Hex;
    readonly deployable: string;
  }[];
  readonly deployables: {
    readonly [id: string]: readonly (Hex | { readonly deployable: string })[];
  };
};

function getDeployableId(ref: ReferenceIdentifier): string {
  return `${ref.sourcePath}:${ref.name}`;
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
    deployableArtifacts.map((artifact) => [
      getDeployableId(artifact),
      artifact.bytecode.map((part) =>
        referenceIdentifier.allows(part) ? { deployable: getDeployableId(part) } : part,
      ),
    ]),
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
