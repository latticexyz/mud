import path from "node:path";
import { Account, Address, Chain, Client, Transport } from "viem";
import { createMirrorPlan } from "./createMirrorPlan";
import { executeMirrorPlan } from "./executeMirrorPlan";

// TODO: attempt to create world the same way as it was originally created, thus preserving world address
// TODO: set up table to track migrated records with original metadata (block number/timestamp) and for lazy migrations

export async function mirror({
  rootDir,
  from,
  to,
}: {
  rootDir: string;
  from: {
    client: Client;
    indexer: string;
    world: Address;
    block?: bigint;
    blockscout: string;
  };
  to: {
    client: Client<Transport, Chain | undefined, Account>;
    world: Address;
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

  console.log("creating plan");
  const planFilename = await createMirrorPlan({ rootDir, from });

  // TODO: show plan summary, prompt to continue

  console.log("executing plan at", path.relative(rootDir, planFilename));
  await executeMirrorPlan({ planFilename, to });
}
