import { Address, Client } from "viem";

// TODO: decide if preserving world address is important (chain config has to change anyway)

export async function mirror(opts: {
  from: {
    world: Address;
    client: Client;
    indexer?: string;
  };
  to: {
    client: Client;
  };
}) {
  // TODO: check for world balance, warn
  //
  // TODO: get world salt, factory, and deployer address
  // TODO: prepare world deploy, make sure resulting world addresses will match
  // TODO: deploy world
  //
  // TODO: set up a table to track migrated records? would make this idempotent and enable lazy mirroring
  //
  // TODO: fetch data from indexer
  // TODO: check each system for state/balance, warn
  //
  // TODO: set records for each table
  //
  // TODO: deploy each system via original bytecode
  // TODO: update system addresses as necessary (should this be done as part of setting records?)
}
