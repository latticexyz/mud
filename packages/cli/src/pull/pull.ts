import { Address, Client, hexToString, stringToHex } from "viem";
import { getTables } from "../deploy/getTables";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { unique } from "@latticexyz/common/utils";
import { getSchemaTypes } from "@latticexyz/protocol-parser/internal";
import prettier from "prettier";
import { resourceToHex } from "@latticexyz/common";
import metadataConfig from "@latticexyz/world-module-metadata/mud.config";
import { getRecord } from "../deploy/getRecord";
import path from "node:path";
import fs from "node:fs/promises";

export type PullOptions = {
  rootDir: string;
  client: Client;
  worldAddress: Address;
};

export async function pull({ rootDir, client, worldAddress }: PullOptions) {
  const worldDeploy = await getWorldDeploy(client, worldAddress);
  const tables = await getTables({ client, worldDeploy });

  const ignoredNamespaces = new Set(["store", "world"]);
  const namespaces = unique(tables.map((table) => table.namespace))
    .filter((namespace) => !ignoredNamespaces.has(namespace))
    .map((namespace) => ({ namespace, namespaceId: resourceToHex({ type: "namespace", namespace, name: "" }) }));

  const resourceIds = [
    ...namespaces.map((namespace) => namespace.namespaceId),
    ...tables.map((table) => table.tableId),
  ];

  const labels = Object.fromEntries(
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
    ),
  );

  const config = {
    namespaces: Object.fromEntries(
      namespaces.map(({ namespace, namespaceId }) => {
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
                    },
                  ];
                }),
            ),
          },
        ];
      }),
    ),
  };

  const configSource = `
    import { defineWorld } from "@latticexyz/world";

    export default defineWorld(${JSON.stringify(config)});
  `;

  const formattedConfig = await prettier.format(configSource, {
    parser: "typescript",
  });

  await fs.writeFile(path.join(rootDir, "mud.config.ts"), formattedConfig);
}
