import { mkdir, writeFile } from "node:fs/promises";
import { ResolvedSystem, resolveSystems } from "./resolveSystems";
import { World } from "../config/v2/output";
import { ContractArtifact, systemsManifestFilename } from "./common";
import { findContractArtifacts } from "./findContractArtifacts";
import { getOutDirectory as getForgeOutDirectory } from "@latticexyz/common/foundry";
import path from "node:path";
import { Abi, Hex, isHex } from "viem";
import { formatAbi, formatAbiItem } from "abitype";
import { debug } from "./debug";
import { type } from "arktype";

export const SystemsManifest = type({
  systems: [
    {
      // labels
      namespaceLabel: "string",
      label: "string",
      // resource ID
      namespace: "string",
      name: "string",
      systemId: ["string", ":", (s): s is Hex => isHex(s, { strict: false })],
      // abi
      abi: "string[]",
      worldAbi: "string[]",
    },
    "[]",
  ],
  createdAt: "number",
});

export async function buildSystemsManifest(opts: { rootDir: string; config: World }): Promise<void> {
  // we have to import these at runtime because they may not yet exist at build time
  const { default: IBaseWorldAbi } = await import("../../out/IBaseWorld.sol/IBaseWorld.abi.json");
  const { default: SystemAbi } = await import("../../out/System.sol/System.abi.json");
  const excludedAbi = formatAbi([
    ...IBaseWorldAbi.filter((item) => item.type === "event" || item.type === "error"),
    ...SystemAbi,
  ] as Abi);

  const systems = await resolveSystems(opts);

  const forgeOutDir = await getForgeOutDirectory({ cwd: opts.rootDir });
  const contractArtifacts = await findContractArtifacts({ forgeOutDir: path.join(opts.rootDir, forgeOutDir) });

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
    systems: systems.map((system): (typeof SystemsManifest)["infer"]["systems"][number] => {
      const artifact = getSystemArtifact(system);
      const abi = artifact.abi.filter((item) => !excludedAbi.includes(formatAbiItem(item)));
      const worldAbi = system.deploy.registerWorldFunctions
        ? abi.map((item) =>
            item.type === "function"
              ? { ...item, name: system.namespace ? `${system.namespace}__${item.name}` : item.name }
              : item,
          )
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
    createdAt: Date.now(),
  } satisfies typeof SystemsManifest.infer;

  const outFile = path.join(opts.rootDir, systemsManifestFilename);
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(manifest, null, 2) + "\n");
  debug("Wrote systems manifest to", systemsManifestFilename);
}
