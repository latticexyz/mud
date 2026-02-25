import { Address, Client, Hex, isAddress } from "viem";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { getChainId } from "viem/actions";
import { getTables } from "../deploy/getTables";
import { resourceToLabel } from "@latticexyz/common";
import { getRecordsAsLogs } from "@latticexyz/store-sync";
import pRetry from "p-retry";
import { Table } from "@latticexyz/config";
import path from "path";
import { createPlanWriter } from "./createPlanWriter";
import { mkdir, rm } from "fs/promises";
import { mirrorPlansDirectory } from "./common";
import { getSystems } from "../deploy/getSystems";
import { getDeployedBytecode } from "./getDeployedBytecode";
import { debug } from "./debug";
import worldConfig from "@latticexyz/world/mud.config";

// TODO: attempt to create world the same way as it was originally created, thus preserving world address
// TODO: set up table to track migrated records with original metadata (block number/timestamp) and for lazy migrations

export async function createMirrorPlan({
  rootDir,
  from,
}: {
  rootDir: string;
  from: {
    block?: bigint;
    world: Address;
    client: Client;
    indexer: string;
    blockscout: string;
  };
}) {
  const fromChainId = await getChainId(from.client);

  const planFilename = path.join(rootDir, mirrorPlansDirectory, `${fromChainId}_${from.world.toLowerCase()}.ndjson.gz`);
  await mkdir(path.dirname(planFilename), { recursive: true });

  const plan = createPlanWriter(planFilename);

  const makePlan = (async () => {
    const worldDeploy = await getWorldDeploy(from.client, from.world, from.block);

    debug("getting systems");
    const systems = await getSystems({
      client: from.client,
      worldDeploy,
      indexerUrl: from.indexer,
      chainId: fromChainId,
    });

    debug("getting bytecode for", systems.length, "systems");
    const systemsWithBytecode = await Promise.all(
      systems.map(async (system) => {
        const bytecode = await getDeployedBytecode({
          client: from.client,
          address: system.address,
          debugLabel: `${resourceToLabel(system)} system`,
          allowedStorage: ["empty", { worldConsumer: worldDeploy.address }],
          blockscoutUrl: from.blockscout,
        });
        return { system, bytecode };
      }),
    );
    for (const { system, bytecode } of systemsWithBytecode) {
      if (!bytecode) continue;
      plan.write({ step: "deploySystem", system, bytecode });
    }

    const tables = await getTables({
      client: from.client,
      worldDeploy,
      indexerUrl: from.indexer,
      chainId: fromChainId,
    });

    const hookAddresses = new Set<Address>();

    // TODO: sort tables so that the insert order is correct (e.g. namespaces first)

    let count = 0;
    for (const table of tables) {
      const logs = await pRetry(() =>
        getRecordsAsLogs<Table>({
          worldAddress: from.world,
          table: table as never,
          client: from.client,
          indexerUrl: from.indexer,
          chainId: fromChainId,
        }),
      );
      debug("got", logs.length, "logs for", resourceToLabel(table));
      for (const log of logs) {
        if (log.args.tableId === worldConfig.namespaces.world.tables.SystemHooks.tableId) {
          for (const hookAddress of extractHookAddresses(log.args.dynamicData)) {
            hookAddresses.add(hookAddress);
          }
        }
        plan.write({ step: "setRecord", record: log.args });
      }
      count += logs.length;
    }
    debug("got", count, "total record logs");

    if (hookAddresses.size > 0) {
      debug("getting bytecode for", hookAddresses.size, "system hooks");
      const hooksWithBytecode = await Promise.all(
        Array.from(hookAddresses).map(async (hookAddress) => {
          const bytecode = await getDeployedBytecode({
            client: from.client,
            address: hookAddress,
            debugLabel: `system hook ${hookAddress}`,
            allowedStorage: ["empty", { worldConsumer: worldDeploy.address }],
            blockscoutUrl: from.blockscout,
          });
          return { hookAddress, bytecode };
        }),
      );

      for (const { hookAddress, bytecode } of hooksWithBytecode) {
        if (!bytecode) continue;
        plan.write({ step: "deployHook", hookAddress, bytecode });
      }
    }
  })();

  try {
    try {
      await makePlan;
    } finally {
      console.log("writing plan to", path.relative(rootDir, planFilename));
      await plan.end();
    }
    return planFilename;
  } catch (error) {
    await rm(planFilename, { force: true });
    throw error;
  }
}

function extractHookAddresses(dynamicData: Hex): Address[] {
  if (dynamicData === "0x") return [];

  const bytes = dynamicData.slice(2);
  const hookSize = 21 * 2; // bytes21 encoded as hex chars
  if (bytes.length % hookSize !== 0) {
    debug("unexpected SystemHooks value length:", bytes.length);
    return [];
  }

  const addresses: Address[] = [];
  for (let offset = 0; offset < bytes.length; offset += hookSize) {
    const hook = bytes.slice(offset, offset + hookSize);
    const address = `0x${hook.slice(0, 40)}`;
    if (isAddress(address, { strict: false })) {
      addresses.push(address as Address);
    }
  }
  return addresses;
}
