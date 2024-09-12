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
import { formatTypescript } from "@latticexyz/common/codegen";
import { execa } from "execa";
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

  console.log(labels);
  const namespaces = resources.filter((resource) => resource.type === "namespace");

  const worldFunctions = await getFunctions({
    client,
    worldAddress: worldDeploy.address,
    fromBlock: worldDeploy.deployBlock,
    toBlock: worldDeploy.stateBlock,
  });

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

  await Promise.all(
    systems
      .map((system) => ({
        ...system,
        // skip functions that use tuples for now, because they can't compile unless they're represented as structs
        // but if we hoist tuples into structs, you have to use the interface's specific struct rather any struct
        // of the same shape
        abi: system.abi.filter((item) => {
          if (
            item.type === "function" &&
            [...item.inputs, ...item.outputs].some((param) => param.type === "tuple" || param.type === "tuple[]")
          ) {
            debug(
              `System function \`${system.label}.${item.name}\` is using a tuple argument or return type, which is not yet supported by interface generation. Skipping...`,
            );
            return false;
          }
          return true;
        }),
      }))
      .filter((system) => system.abi.length)
      .map(async (system) => {
        const interfaceName = `I${system.label}`;
        const systemAbi = path.join(rootDir, `.mud/systems/${system.systemId}.abi.json`);
        const systemInterface = path.join(rootDir, `src/namespaces/${system.namespaceLabel}/${interfaceName}.sol`);

        debug("writing system ABI for", interfaceName, "to", path.relative(rootDir, systemAbi));
        await writeFile(systemAbi, JSON.stringify(system.abi));

        debug("generating system interface", interfaceName, "to", path.relative(rootDir, systemInterface));
        await execa("cast", [
          "interface",
          "--name",
          interfaceName,
          "--pragma",
          ">=0.8.24",
          "-o",
          systemInterface,
          systemAbi,
        ]);
      }),
  );

  const abi = systems
    .map((system) => ({
      ...system,
      // skip functions that use tuples for now, because they can't compile unless they're represented as structs
      // but if we hoist tuples into structs, you have to use the interface's specific struct rather any struct
      // of the same shape
      worldAbi: system.worldAbi.filter((item) => {
        if (
          item.type === "function" &&
          [...item.inputs, ...item.outputs].some((param) => param.type === "tuple" || param.type === "tuple[]")
        ) {
          debug(
            `World function \`${item.name}\` (from ${system.label}) is using a tuple argument or return type, which is not yet supported by interface generation. Skipping...`,
          );
          return false;
        }
        return true;
      }),
    }))
    .flatMap((system) => system.worldAbi);

  if (abi.length) {
    const worldAbi = path.join(rootDir, `.mud/systems/world.abi.json`);
    const worldInterface = path.join(rootDir, `src/IWorldSystems.sol`);

    debug("writing world systems ABI to", path.relative(rootDir, worldAbi));
    await writeFile(worldAbi, JSON.stringify(abi));

    debug("generating world systems interface to", path.relative(rootDir, worldInterface));
    await execa("cast", [
      "interface",
      "--name",
      "IWorldSystems",
      "--pragma",
      ">=0.8.24",
      "-o",
      worldInterface,
      worldAbi,
    ]);
  }
}

async function writeFile(filename: string, contents: string) {
  await fs.mkdir(path.dirname(filename), { recursive: true });
  await fs.writeFile(filename, contents);
}
