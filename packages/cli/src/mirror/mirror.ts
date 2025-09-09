import { Account, Address, Chain, Client, Transport } from "viem";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { getChainId } from "viem/actions";
import { getTables } from "../deploy/getTables";
import { resourceToLabel } from "@latticexyz/common";
import { getRecordsAsLogs } from "@latticexyz/store-sync";
import pRetry from "p-retry";
import { Table } from "@latticexyz/config";
import path from "path";
import { createJsonArrayWriter } from "./createJsonArrayWriter";
import { createMirrorPlan } from "./createMirrorPlan";

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

  const planFilename = await createMirrorPlan({ rootDir, from });

  console.log("wrote plan to", path.relative(rootDir, planFilename));
}
