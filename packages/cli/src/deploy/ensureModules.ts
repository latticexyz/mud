import { Client, Transport, Chain, Account, Hex } from "viem";
import { writeContract } from "@latticexyz/common";
import { Module, WorldDeploy, worldAbi } from "./common";
import { ensureContract } from "./ensureContract";
import { debug } from "./debug";
import { uniqueBy, wait } from "@latticexyz/common/utils";
import pRetry from "p-retry";

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
    uniqueBy(modules, (mod) => mod.address).map((mod) =>
      ensureContract({ client, bytecode: mod.bytecode, label: `${mod.name} module` })
    )
  );

  // then start installing modules
  debug("installing modules:", modules.map((mod) => mod.name).join(", "));
  const installTxs = await Promise.all(
    modules.map((mod) =>
      mod.installAsRoot
        ? pRetry(
            () =>
              writeContract(client, {
                chain: client.chain ?? null,
                address: worldDeploy.address,
                abi: worldAbi,
                // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
                functionName: "installRootModule",
                args: [mod.address, mod.installData],
              }),
            {
              retries: 3,
              onFailedAttempt: async (error) => {
                const delay = error.attemptNumber * 500;
                debug(`failed to install root module ${mod.name}, retrying in ${delay}ms...`);
                await wait(delay);
              },
            }
          )
        : pRetry(
            () =>
              writeContract(client, {
                chain: client.chain ?? null,
                address: worldDeploy.address,
                abi: worldAbi,
                // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
                functionName: "installModule",
                args: [mod.address, mod.installData],
              }),
            {
              retries: 3,
              onFailedAttempt: async (error) => {
                const delay = error.attemptNumber * 500;
                debug(`failed to install module ${mod.name}, retrying in ${delay}ms...`);
                await wait(delay);
              },
            }
          )
    )
  );

  return (await Promise.all([...contractTxs, ...installTxs])).flat();
}
