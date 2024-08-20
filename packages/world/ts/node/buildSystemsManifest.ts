import { mkdir, writeFile } from "node:fs/promises";
import { ResolvedSystem, resolveSystems } from "./resolveSystems";
import { World } from "../config/v2";
import { ContractArtifact } from "./common";
import { findContractArtifacts } from "./findContractArtifacts";
import { getOutDirectory as getForgeOutDirectory } from "@latticexyz/common/foundry";
import path from "node:path";
import { Hex, Abi } from "viem";
import { formatAbi, formatAbiItem } from "abitype";
import IBaseWorldAbi from "../../out/IBaseWorld.sol/IBaseWorld.abi.json";
import SystemAbi from "../../out/System.sol/System.abi.json";

const excludedAbi = formatAbi([
  ...IBaseWorldAbi.filter((item) => item.type === "event" || item.type === "error"),
  ...SystemAbi,
] as Abi);

export type SystemsManifest = {
  readonly systems: readonly {
    readonly namespaceLabel: string;
    readonly label: string;
    readonly namespace: string;
    readonly name: string;
    readonly systemId: Hex;
    readonly abi: string[];
  }[];
};

export async function buildSystemsManifest(opts: { rootDir: string; config: World }): Promise<void> {
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
      const abi = artifact.abi.filter((item) => !excludedAbi.includes(formatAbiItem(item)));
      const worldAbi = system.deploy.registerWorldFunctions
        ? abi.map((item) => (item.type === "function" ? { ...item, name: `${system.namespace}__${item.name}` } : item))
        : [];
      return {
        // labels
        namespaceLabel: system.namespaceLabel,
        label: system.label,
        // resource ID
        namespace: system.namespace,
        name: system.name,
        systemId: system.systemId,
        // abi
        abi: formatAbi(abi).sort((a, b) => a.localeCompare(b)),
        worldAbi: formatAbi(worldAbi).sort((a, b) => a.localeCompare(b)),
      };
    }),
  } satisfies SystemsManifest;

  const outFile = path.join(opts.rootDir, ".mud/local/systems.json");
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(manifest, null, 2) + "\n");
}
