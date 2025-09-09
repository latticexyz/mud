import { Account, Address, Chain, Client, Transport, getAddress, isAddress, isHex, size, withCache } from "viem";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { getChainId, getCode } from "viem/actions";
import { getTables } from "../deploy/getTables";
import { resourceToLabel } from "@latticexyz/common";
import { getRecordsAsLogs } from "@latticexyz/store-sync";
import pRetry from "p-retry";
import { Table } from "@latticexyz/config";
import path from "path";
import { createJsonArrayWriter } from "./createJsonArrayWriter";
import { mkdir, rm } from "fs/promises";
import { mirrorPlansDirectory } from "./common";
import { getSystems } from "../deploy/getSystems";
import { execa } from "execa";
import { getDeployedBytecode } from "./getDeployedBytecode";

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
  };
}) {
  const fromChainId = await getChainId(from.client);

  const planFilename = path.join(rootDir, mirrorPlansDirectory, `${fromChainId}_${getAddress(from.world)}`);
  await mkdir(path.dirname(planFilename), { recursive: true });

  const plan = createJsonArrayWriter(planFilename);

  const makePlan = (async () => {
    plan.push({ step: "mirror", chainId: fromChainId, world: from.world });

    const worldDeploy = await getWorldDeploy(from.client, from.world, from.block);
    console.log("getting systems");
    const systems = await getSystems({
      client: from.client,
      worldDeploy,
      indexerUrl: from.indexer,
      chainId: fromChainId,
    });

    console.log("getting bytecode for", systems.length, "systems");
    const systemsWithBytecode = await Promise.all(
      systems.map(async (system) => {
        const bytecode = await getDeployedBytecode({ client: from.client, address: system.address });
        return { system, bytecode };
      }),
    );
    for (const { system, bytecode } of systemsWithBytecode) {
      plan.push({ type: "deploySystem", system, bytecode });
    }

    const tables = await getTables({
      client: from.client,
      worldDeploy,
      indexerUrl: from.indexer,
      chainId: fromChainId,
    });

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
      console.log("got", logs.length, "logs for", resourceToLabel(table));
      for (const log of logs) {
        plan.push({ step: "setRecord", record: log.args });
      }
      count += logs.length;
    }
    console.log("got", count, "total records");
  })();

  try {
    try {
      await makePlan;
    } finally {
      console.log("writing plan to disk");
      plan.end();
    }
    return planFilename;
  } catch (error) {
    await rm(planFilename);
    throw error;
  }
}
