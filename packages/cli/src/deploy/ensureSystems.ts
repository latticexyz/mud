import { Client, Transport, Chain, Account, Address, Hex, getCreate2Address } from "viem";
import { hasResource } from "./hasResource";
import { writeContract } from "@latticexyz/common";
import { System, salt, worldAbi } from "./common";
import { deployer } from "./deployer";
import { ensureContract } from "./ensureContract";
import { identity } from "@latticexyz/common/utils";
import { debug } from "./debug";

export async function ensureSystems({
  client,
  worldAddress,
  systems: systems_,
}: {
  client: Client<Transport, Chain | undefined, Account>;
  worldAddress: Address;
  systems: System[];
}): Promise<Hex[]> {
  debug("checking systems");
  const systems = await Promise.all(
    Object.values(systems_).map(async (system) => ({
      ...system,
      address: getCreate2Address({ from: deployer, bytecode: system.bytecode, salt }),
      exists: await hasResource(client, worldAddress, system.systemId),
    }))
  );

  const existing = systems.filter((system) => system.exists);
  if (existing.length > 0) {
    debug("existing systems", existing.map((system) => system.label).join(", "));
  }

  const missing = systems.filter((system) => !system.exists);
  if (missing.length > 0) {
    // TODO: deploy systems
    debug("registering systems", missing.map((system) => system.label).join(", "));
    const contractTxs = (await Promise.all(missing.map((system) => ensureContract(client, system.bytecode)))).flatMap(
      identity
    );
    return await Promise.all([
      ...contractTxs,
      ...missing.map((system) =>
        writeContract(client, {
          chain: client.chain ?? null,
          address: worldAddress,
          abi: worldAbi,
          functionName: "registerSystem",
          args: [system.systemId, system.address, system.allowAll],
        })
      ),
    ]);
  }

  return [];
}
