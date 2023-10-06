import { Client, Transport, Chain, Account, Hex, getAddress } from "viem";
import { writeContract } from "@latticexyz/common";
import { Module, WorldDeploy, worldAbi } from "./common";
import { ensureContract } from "./ensureContract";
import { debug } from "./debug";
import { resourceLabel } from "./resourceLabel";
import { getSystems } from "./getSystems";
import { getResourceAccess } from "./getResourceAccess";

export async function ensureSystems({
  client,
  worldDeploy,
  modules,
}: {
  client: Client<Transport, Chain | undefined, Account>;
  worldDeploy: WorldDeploy;
  modules: Module[];
}): Promise<Hex[]> {
  // kick off contract deployments first, otherwise installing modules can fail
  const contractTxs = await Promise.all(
    modules.map((mod) => ensureContract({ client, bytecode: mod.bytecode, label: `${mod.name} module` }))
  );

  // then start installing modules
  const installTxs = await Promise.all(
    modules.map((mod) =>
      mod.installAsRoot
        ? writeContract(client, {
            chain: client.chain ?? null,
            address: worldDeploy.address,
            abi: worldAbi,
            // TODO: replace with batchCall
            functionName: "installRootModule",
            args: [mod.address, mod.installData],
          })
        : writeContract(client, {
            chain: client.chain ?? null,
            address: worldDeploy.address,
            abi: worldAbi,
            // TODO: replace with batchCall
            functionName: "installModule",
            args: [mod.address, mod.installData],
          })
    )
  );

  return (await Promise.all([...contractTxs, ...installTxs])).flat();
}
