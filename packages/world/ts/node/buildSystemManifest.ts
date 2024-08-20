import { mkdir, writeFile } from "node:fs/promises";
import { ResolvedSystem, resolveSystems } from "./resolveSystems";
import { World } from "../config/v2";
import { ContractArtifact } from "./common";
import { findContractArtifacts } from "./findContractArtifacts";
import { getOutDirectory as getForgeOutDirectory } from "@latticexyz/common/foundry";
import path from "node:path";
import { Hex, Abi } from "viem";

export type SystemManifest = {
  readonly systems: readonly {
    readonly systemId: Hex;
    readonly abi: Abi;
  }[];
};

export async function buildSystemManifest(opts: { rootDir: string; config: World }): Promise<void> {
  const systems = await resolveSystems(opts);

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

  const manifest = {
    systems: systems.map((system) => {
      const artifact = getSystemArtifact(system);
      return {
        systemId: system.systemId,
        abi: artifact.abi,
      };
    }),
  } satisfies SystemManifest;

  const outFile = path.join(opts.rootDir, ".mud/local/systems.json");
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(manifest, null, 2));
}
