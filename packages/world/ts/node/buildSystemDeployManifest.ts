import { mkdir, writeFile } from "node:fs/promises";
import { resolveSystems } from "./resolveSystems";
import { World } from "../config/v2";
import { LibraryDeploy, SystemDeploy } from "./common";
import { findContractArtifacts } from "./findContractArtifacts";
import { getOutDirectory as getForgeOutDirectory } from "@latticexyz/common/foundry";
import { uniqueBy } from "@latticexyz/common/utils";
import path from "node:path";

export type SystemDeployManifest = {
  readonly systems: readonly SystemDeploy[];
  readonly libraries: readonly LibraryDeploy[];
};

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

  const systemArtifacts = systems.map((system) => {
    const artifact = contractArtifacts.find((a) => a.sourcePath === system.sourcePath && a.name === system.label);
    if (!artifact) {
      throw new Error(
        `Could not find build artifact for system \`${system.label}\` at \`${system.sourcePath}\`. Did \`forge build\` run successfully?`,
      );
    }
    return { ...system, bytecode: artifact.bytecode, placeholders: artifact.placeholders };
  });

  const libraryArtifacts = uniqueBy(
    systemArtifacts.flatMap((system) => system.placeholders.map(({ sourcePath, name }) => ({ sourcePath, name }))),
    ({ sourcePath, name }) => `${sourcePath}:${name}`,
  ).map(({ sourcePath, name }) => {
    const artifact = contractArtifacts.find((a) => a.sourcePath === sourcePath && a.name === name);
    if (!artifact) {
      throw new Error(
        `Could not find build artifact for reference \`${name}\` at \`${sourcePath}\`. Did \`forge build\` run successfully?`,
      );
    }
    return artifact;
  });

  // TODO: sort by deploy order?

  const outFile = path.join(rootDir, ".mud/pending/systems.json");
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(
    outFile,
    JSON.stringify(
      {
        systems: systemArtifacts,
        libraries: libraryArtifacts,
      },
      null,
      2,
    ),
  );
}
