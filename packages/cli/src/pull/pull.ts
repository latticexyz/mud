import { Address, Client, hexToString, parseAbi, stringToHex } from "viem";
import { getTables } from "../deploy/getTables";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { getSchemaTypes } from "@latticexyz/protocol-parser/internal";
import { hexToResource, resourceToHex } from "@latticexyz/common";
import metadataConfig from "@latticexyz/world-module-metadata/mud.config";
import { getRecord } from "../deploy/getRecord";
import path from "node:path";
import fs from "node:fs/promises";
import { getResourceIds } from "../deploy/getResourceIds";
import { getFunctions } from "@latticexyz/world/internal";
import { abiToInterface, formatSolidity, formatTypescript } from "@latticexyz/common/codegen";
import { debug } from "./debug";

const ignoredNamespaces = new Set(["store", "world", "metadata"]);

function namespaceToHex(namespace: string) {
  return resourceToHex({ type: "namespace", namespace, name: "" });
}

export type PullOptions = {
  rootDir: string;
  client: Client;
  worldAddress: Address;
};

export async function pull({ rootDir, client, worldAddress }: PullOptions) {
  const worldDeploy = await getWorldDeploy(client, worldAddress);
  const resourceIds = await getResourceIds({ client, worldDeploy });
  const resources = resourceIds.map(hexToResource).filter((resource) => !ignoredNamespaces.has(resource.namespace));
  const tables = await getTables({ client, worldDeploy });

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
        const abi = parseAbi(
          metadataAbi.length ? metadataAbi : functions.map((func) => `function ${func.systemFunctionSignature}`),
        );
        const worldAbi = parseAbi(
          metadataWorldAbi.length ? metadataWorldAbi : functions.map((func) => `function ${func.signature}`),
        );

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

  const config = {
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

  await writeFile(
    path.join(rootDir, "mud.config.ts"),
    await formatTypescript(`
      import { defineWorld } from "@latticexyz/world";

      export default defineWorld(${JSON.stringify(config)});
    `),
  );

  for (const system of systems.filter((system) => system.abi.length)) {
    const interfaceName = `I${system.label}`;
    const interfaceFile = `src/namespaces/${system.namespaceLabel}/${interfaceName}.sol`;
    const source = abiToInterface({ name: interfaceName, systemId: system.systemId, abi: system.abi });

    debug("generating system interface", interfaceName, "to", interfaceFile);
    await writeFile(path.join(rootDir, interfaceFile), await formatSolidity(source));
  }

  const worldAbi = systems.flatMap((system) => system.worldAbi);
  if (worldAbi.length) {
    const interfaceName = "IWorldSystems";
    const interfaceFile = `src/${interfaceName}.sol`;
    const source = abiToInterface({ name: interfaceName, abi: worldAbi });

    debug("generating world systems interface to", interfaceFile);
    await writeFile(path.join(rootDir, interfaceFile), await formatSolidity(source));
  }
}

async function writeFile(filename: string, contents: string) {
  await fs.mkdir(path.dirname(filename), { recursive: true });
  await fs.writeFile(filename, contents);
}
