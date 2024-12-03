import { Address, Client, hexToString, parseAbiItem, stringToHex } from "viem";
import { getTables } from "../deploy/getTables";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { getSchemaTypes } from "@latticexyz/protocol-parser/internal";
import { hexToResource, resourceToHex } from "@latticexyz/common";
import metadataConfig from "@latticexyz/world-module-metadata/mud.config";
import { getRecord } from "../deploy/getRecord";
import path from "node:path";
import fs from "node:fs/promises";
import { getResourceIds } from "../deploy/getResourceIds";
import { getFunctions } from "@latticexyz/store-sync/world";
import { abiToInterface, formatSolidity, formatTypescript } from "@latticexyz/common/codegen";
import { debug } from "./debug";
import { defineWorld } from "@latticexyz/world";
import { findUp } from "find-up";
import { isDefined } from "@latticexyz/common/utils";

const ignoredNamespaces = new Set(["store", "world", "metadata"]);

function namespaceToHex(namespace: string) {
  return resourceToHex({ type: "namespace", namespace, name: "" });
}

export class WriteFileExistsError extends Error {
  name = "WriteFileExistsError";
  constructor(public filename: string) {
    super(`Attempted to write file at "${filename}", but it already exists.`);
  }
}

export type PullOptions = {
  rootDir: string;
  client: Client;
  worldAddress: Address;
  /**
   * Replace existing files and directories with data from remote world.
   * Defaults to `true` if `rootDir` is within a git repo, otherwise `false`.
   * */
  replace?: boolean;
  indexerUrl?: string;
  chainId?: number;
};

export async function pull({ rootDir, client, worldAddress, replace, indexerUrl, chainId }: PullOptions) {
  const replaceFiles = replace ?? (await findUp(".git", { cwd: rootDir })) != null;

  const worldDeploy = await getWorldDeploy(client, worldAddress);
  const resourceIds = await getResourceIds({ client, worldDeploy, indexerUrl, chainId });
  const resources = resourceIds.map(hexToResource).filter((resource) => !ignoredNamespaces.has(resource.namespace));
  const tables = await getTables({ client, worldDeploy, indexerUrl, chainId });

  const labels = Object.fromEntries(
    (
      await Promise.all(
        resourceIds.map(async (resourceId) => {
          const { value: bytesValue } = await getRecord({
            client,
            worldDeploy,
            table: metadataConfig.tables.metadata__ResourceTag,
            key: { resource: resourceId, tag: stringToHex("label", { size: 32 }) },
          });
          const value = hexToString(bytesValue);
          return [resourceId, value === "" ? null : value];
        }),
      )
    ).filter(([, label]) => label != null),
  );
  // ensure we always have a root namespace label
  labels[namespaceToHex("")] ??= "root";

  const worldFunctions = await getFunctions({
    client,
    worldAddress: worldDeploy.address,
    fromBlock: worldDeploy.deployBlock,
    toBlock: worldDeploy.stateBlock,
    indexerUrl,
    chainId,
  });

  const namespaces = resources.filter((resource) => resource.type === "namespace");
  const systems = await Promise.all(
    resources
      .filter((resource) => resource.type === "system")
      .map(async ({ namespace, name, resourceId: systemId }) => {
        const namespaceId = namespaceToHex(namespace);
        // the system name from the system ID can be potentially truncated, so we'll strip off
        // any partial "System" suffix and replace it with a full "System" suffix so that it
        // matches our criteria for system names
        const systemLabel = labels[systemId] ?? name.replace(/(S(y(s(t(e(m)?)?)?)?)?)?$/, "System");

        const [metadataAbi, metadataWorldAbi] = await Promise.all([
          getRecord({
            client,
            worldDeploy,
            table: metadataConfig.tables.metadata__ResourceTag,
            key: { resource: systemId, tag: stringToHex("abi", { size: 32 }) },
          })
            .then((record) => hexToString(record.value))
            .then((value) => (value !== "" ? value.split("\n") : [])),
          getRecord({
            client,
            worldDeploy,
            table: metadataConfig.tables.metadata__ResourceTag,
            key: { resource: systemId, tag: stringToHex("worldAbi", { size: 32 }) },
          })
            .then((record) => hexToString(record.value))
            .then((value) => (value !== "" ? value.split("\n") : [])),
        ]);

        const functions = worldFunctions.filter((func) => func.systemId === systemId);

        // If empty or unset ABI in metadata table, backfill with world functions.
        // These don't have parameter names or return values, but better than nothing?
        const abi = (
          metadataAbi.length ? metadataAbi : functions.map((func) => `function ${func.systemFunctionSignature}`)
        )
          .map((sig) => {
            try {
              return parseAbiItem(sig);
            } catch {
              debug(`Skipping invalid system signature: ${sig}`);
            }
          })
          .filter(isDefined);

        const worldAbi = (
          metadataWorldAbi.length ? metadataWorldAbi : functions.map((func) => `function ${func.signature}`)
        )
          .map((sig) => {
            try {
              return parseAbiItem(sig);
            } catch {
              debug(`Skipping invalid world signature: ${sig}`);
            }
          })
          .filter(isDefined);

        return {
          namespaceId,
          namespaceLabel: labels[namespaceId] ?? namespace,
          label: systemLabel,
          systemId,
          namespace,
          name,
          abi,
          worldAbi,
        };
      }),
  );

  debug("generating config");
  const configInput = {
    namespaces: Object.fromEntries(
      namespaces.map(({ namespace, resourceId: namespaceId }) => {
        const namespaceLabel = labels[namespaceId] ?? namespace;
        return [
          namespaceLabel,
          {
            ...(namespaceLabel !== namespace ? { namespace } : null),
            tables: Object.fromEntries(
              tables
                .filter((table) => table.namespace === namespace)
                .map((table) => {
                  const tableLabel = labels[table.tableId] ?? table.name;
                  return [
                    tableLabel,
                    {
                      ...(tableLabel !== table.name ? { name: table.name } : null),
                      ...(table.type !== "table" ? { type: table.type } : null),
                      schema: getSchemaTypes(table.schema),
                      key: table.key,
                      deploy: { disabled: true },
                    },
                  ];
                }),
            ),
          },
        ];
      }),
    ),
  };

  // use the config before writing it so we make sure its valid
  // and because we'll use the default paths to write interfaces
  debug("validating config");
  const config = defineWorld(configInput);

  debug("writing config");
  await writeFile(
    path.join(rootDir, "mud.config.ts"),
    await formatTypescript(`
      import { defineWorld } from "@latticexyz/world";

      export default defineWorld(${JSON.stringify(configInput)});
    `),
    { overwrite: replaceFiles },
  );

  const remoteDir = path.join(config.sourceDirectory, "remote");
  if (replaceFiles) {
    await fs.rm(remoteDir, { recursive: true, force: true });
  }

  for (const system of systems.filter((system) => system.abi.length)) {
    const interfaceName = `I${system.label}`;
    const interfaceFile = path.join(remoteDir, "namespaces", system.namespaceLabel, `${interfaceName}.sol`);

    debug("writing system interface", interfaceName, "to", interfaceFile);
    const source = abiToInterface({ name: interfaceName, systemId: system.systemId, abi: system.abi });
    await writeFile(path.join(rootDir, interfaceFile), await formatSolidity(source), { overwrite: replaceFiles });
  }

  const worldAbi = systems.flatMap((system) => system.worldAbi);
  if (worldAbi.length) {
    const interfaceName = "IWorldSystems";
    const interfaceFile = path.join(remoteDir, `${interfaceName}.sol`);

    debug("writing world systems interface to", interfaceFile);
    const source = abiToInterface({ name: interfaceName, abi: worldAbi });
    await writeFile(path.join(rootDir, interfaceFile), await formatSolidity(source), { overwrite: replaceFiles });
  }

  return { config };
}

export async function exists(filename: string) {
  return fs.access(filename).then(
    () => true,
    () => false,
  );
}

export async function writeFile(filename: string, contents: string, opts: { overwrite?: boolean } = {}) {
  if (!opts.overwrite && (await exists(filename))) {
    throw new WriteFileExistsError(filename);
  }
  await fs.mkdir(path.dirname(filename), { recursive: true });
  await fs.writeFile(filename, contents);
}
