import { Client, Transport, Chain, Account, Address, Hex, getCreate2Address } from "viem";
import { writeContract } from "@latticexyz/common";
import { System, salt, worldAbi } from "./common";
import { deployer } from "./deployer";
import { ensureContract } from "./ensureContract";
import { identity } from "@latticexyz/common/utils";
import { debug } from "./debug";

export async function ensureSystems({
  client,
  worldAddress,
  resourceIds,
  systems,
}: {
  client: Client<Transport, Chain | undefined, Account>;
  worldAddress: Address;
  resourceIds: Hex[];
  systems: System[];
}): Promise<Hex[]> {
  const existing = systems.filter((system) => resourceIds.includes(system.systemId));
  if (existing.length > 0) {
    debug("existing systems", existing.map((system) => system.label).join(", "));
    // TODO: figure out if any need to be upgraded
  }

  const missing = systems.filter((system) => !resourceIds.includes(system.systemId));
  if (missing.length > 0) {
    debug("registering systems", missing.map((system) => system.label).join(", "));
    const contractTxs = (await Promise.all(missing.map((system) => ensureContract(client, system.bytecode)))).flatMap(
      identity
    );
    return await Promise.all([
      ...contractTxs,
      ...missing.map((system) => {
        const systemAddress = getCreate2Address({ from: deployer, bytecode: system.bytecode, salt });
        return writeContract(client, {
          chain: client.chain ?? null,
          address: worldAddress,
          abi: worldAbi,
          // TODO: replace with batchCall
          functionName: "registerSystem",
          args: [system.systemId, systemAddress, system.allowAll],
        });
      }),
    ]);
    // TODO: access control
    // TODO: function selectors
  }

  return [];
}
