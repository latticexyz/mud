import { Client, Transport, Chain, Account, Hex } from "viem";
import { writeContract } from "@latticexyz/common";
import { Module, WorldDeploy, worldAbi } from "./common";
import { ensureContract } from "./ensureContract";
import { debug } from "./debug";

export async function ensureModules({
  client,
  worldDeploy,
  modules,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly worldDeploy: WorldDeploy;
  readonly modules: readonly Module[];
}): Promise<readonly Hex[]> {
  if (!modules.length) return [];

  // kick off contract deployments first, otherwise installing modules can fail
  const contractTxs = await Promise.all(
    modules.map((mod) => ensureContract({ client, bytecode: mod.bytecode, label: `${mod.name} module` }))
  );

  // then start installing modules
  debug("installing modules:", modules.map((mod) => mod.name).join(", "));
  const installTxs = await Promise.all(
    modules.map((mod) =>
      mod.installAsRoot
        ? writeContract(client, {
            chain: client.chain ?? null,
            address: worldDeploy.address,
            abi: worldAbi,
            // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
            functionName: "installRootModule",
            args: [mod.address, mod.installData],
          })
        : writeContract(client, {
            chain: client.chain ?? null,
            address: worldDeploy.address,
            abi: worldAbi,
            // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
            functionName: "installModule",
            args: [mod.address, mod.installData],
          })
    )
  );

  return (await Promise.all([...contractTxs, ...installTxs])).flat();
}
