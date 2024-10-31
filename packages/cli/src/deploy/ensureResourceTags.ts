import { Hex, Client, Transport, Chain, Account, stringToHex, BaseError, concatHex } from "viem";
import { WorldDeploy } from "./common";
import { debug } from "./debug";
import { hexToResource, writeContract } from "@latticexyz/common";
import { identity, isDefined } from "@latticexyz/common/utils";
import metadataConfig from "@latticexyz/world-module-metadata/mud.config";
import metadataAbi from "@latticexyz/world-module-metadata/out/IMetadataSystem.sol/IMetadataSystem.abi.json" assert { type: "json" };
import { ensureModules } from "./ensureModules";
import metadataModule from "@latticexyz/world-module-metadata/out/MetadataModule.sol/MetadataModule.json" assert { type: "json" };
import { getContractArtifact } from "../utils/getContractArtifact";
import { createPrepareDeploy } from "./createPrepareDeploy";
import { waitForTransactions } from "./waitForTransactions";
import { LibraryMap } from "./getLibraryMap";
import { fetchBlockLogs } from "@latticexyz/block-logs-stream";
import { getStoreLogs, flattenStoreLogs } from "@latticexyz/store/internal";
import { logToRecord } from "@latticexyz/store-sync";
import { getKeyTuple, getSchemaPrimitives } from "@latticexyz/protocol-parser/internal";

const metadataModuleArtifact = getContractArtifact(metadataModule);

export type ResourceTag<value> = {
  resourceId: Hex;
  tag: string;
  value: value;
};

export async function ensureResourceTags<const value>({
  client,
  deployerAddress,
  libraryMap,
  worldDeploy,
  tags,
  valueToHex = identity,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly deployerAddress: Hex;
  readonly libraryMap: LibraryMap;
  readonly worldDeploy: WorldDeploy;
  readonly tags: readonly ResourceTag<value>[];
} & (value extends Hex
  ? { readonly valueToHex?: (value: value) => Hex }
  : { readonly valueToHex: (value: value) => Hex })): Promise<readonly Hex[]> {
  debug("ensuring", tags.length, "resource tags");

  debug("looking up existing resource tags");
  const blockLogs = await fetchBlockLogs({
    fromBlock: worldDeploy.deployBlock,
    toBlock: worldDeploy.stateBlock,
    maxBlockRange: 100_000n,
    async getLogs({ fromBlock, toBlock }) {
      return getStoreLogs(client, {
        address: worldDeploy.address,
        fromBlock,
        toBlock,
        tableId: metadataConfig.tables.metadata__ResourceTag.tableId,
      });
    },
  });
  const logs = flattenStoreLogs(blockLogs.flatMap((block) => block.logs));
  const records = logs.map((log) => logToRecord({ log, table: metadataConfig.tables.metadata__ResourceTag }));
  debug("found", records.length, "resource tags");

  const existingTags = new Map(
    records.map((tag) => {
      const key = concatHex(getKeyTuple(metadataConfig.tables.metadata__ResourceTag, tag));
      return [key, tag.value];
    }),
  );

  const desiredTags = tags.map(
    (tag): getSchemaPrimitives<typeof metadataConfig.tables.metadata__ResourceTag.schema> => ({
      resource: tag.resourceId,
      tag: stringToHex(tag.tag, { size: 32 }),
      value: valueToHex(tag.value),
    }),
  );

  const pendingTags = desiredTags.filter((tag) => {
    const key = concatHex(getKeyTuple(metadataConfig.tables.metadata__ResourceTag, tag));
    return existingTags.get(key) !== tag.value;
  });
  if (pendingTags.length === 0) return [];

  // TODO: check if metadata namespace exists, if we own it, and if so transfer ownership to the module before reinstalling
  //       (https://github.com/latticexyz/mud/issues/3035)
  const moduleTxs = await ensureModules({
    client,
    deployerAddress,
    worldDeploy,
    libraryMap,
    modules: [
      {
        optional: true,
        name: "MetadataModule",
        installAsRoot: false,
        installData: "0x",
        prepareDeploy: createPrepareDeploy(metadataModuleArtifact.bytecode, metadataModuleArtifact.placeholders),
        deployedBytecodeSize: metadataModuleArtifact.deployedBytecodeSize,
        abi: metadataModuleArtifact.abi,
      },
    ],
  });

  // Wait for metadata module to be available, otherwise calling the metadata system below may fail.
  // This is only here because OPStack chains don't let us estimate gas with pending block tag.
  await waitForTransactions({
    client,
    hashes: moduleTxs,
    debugLabel: "metadata module installation",
  });

  debug("setting", pendingTags.length, "resource tags");
  return (
    await Promise.all(
      pendingTags.map(async (tag) => {
        const resource = hexToResource(tag.resource);
        // TODO: move to resourceToDebugString
        const resourceString = `${resource.type}:${resource.namespace}:${resource.name}`;
        debug(`tagging ${resourceString} with ${tag.tag}: ${JSON.stringify(tag.value)}`);
        try {
          return await writeContract(client, {
            chain: client.chain ?? null,
            address: worldDeploy.address,
            abi: metadataAbi,
            // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
            functionName: "metadata__setResourceTag",
            args: [tag.resource, tag.tag, tag.value],
          });
        } catch (error) {
          debug(
            `failed to set resource tag for ${resourceString}, skipping\n  ${error instanceof BaseError ? error.shortMessage : error}`,
          );
        }
      }),
    )
  ).filter(isDefined);
}
