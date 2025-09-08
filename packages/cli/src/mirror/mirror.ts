import { createWriteStream } from "fs";
import { createGzip } from "zlib";
import { pipeline } from "stream/promises";
import { Account, Address, Chain, Client, Transport } from "viem";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { getChainId } from "viem/actions";
import { getTables } from "../deploy/getTables";
import { resourceToLabel } from "@latticexyz/common";
import { getRecordsAsLogs } from "@latticexyz/store-sync";
import pRetry from "p-retry";
import { Table } from "@latticexyz/config";
import path from "path";

// TODO: attempt to create world the same way as it was originally created, thus preserving world address
// TODO: set up table to track migrated records with original metadata (block number/timestamp) and for lazy migrations

export async function mirror({
  rootDir,
  from,
  to,
}: {
  rootDir: string;
  from: {
    block?: bigint;
    world: Address;
    client: Client;
    indexer: string;
  };
  to: {
    client: Client<Transport, Chain | undefined, Account>;
  };
}) {
  // TODO: check for world balance, warn
  // TODO: deploy world
  //

  // TODO: fetch data from indexer
  // TODO: check each system for state/balance, warn
  //
  // TODO: set records for each table
  //
  // TODO: deploy each system via original bytecode
  // TODO: update system addresses as necessary (should this be done as part of setting records?)
  //
  const fromChainId = await getChainId(from.client);
  const toChainId = await getChainId(to.client);

  const plan = createPlan(path.join(rootDir, "mud-mirror-plan.json.gz"));
  plan.add("mirror", { from: { chainId: fromChainId, world: from.world }, to: { chainId: toChainId } });

  const worldDeploy = await getWorldDeploy(from.client, from.world, from.block);
  const tables = await getTables({
    client: from.client,
    worldDeploy,
    indexerUrl: from.indexer,
    chainId: fromChainId,
  });

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
      plan.add("setRecord", log.args);
    }
  }

  await plan.end();
}

function createPlan(filename: string) {
  const gzip = createGzip();
  const fileStream = createWriteStream(filename);
  const output = pipeline(gzip, fileStream);
  gzip.write("[\n");
  return {
    add(step: string, data: any) {
      gzip.write(JSON.stringify({ step, data }) + ",\n");
      return this;
    },
    async end() {
      gzip.end("]\n");
      await output;
    },
  };
}
