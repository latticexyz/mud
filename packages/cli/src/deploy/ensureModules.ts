import { Client, Transport, Chain, Account, Hex, BaseError, getAddress } from "viem";
import { writeContract } from "@latticexyz/common";
import { Module, WorldDeploy, worldAbi } from "./common";
import { debug } from "./debug";
import { isDefined, uniqueBy, wait } from "@latticexyz/common/utils";
import pRetry from "p-retry";
import { ensureContractsDeployed } from "./ensureContractsDeployed";

export async function ensureModules({
  client,
  deployerAddress,
  worldDeploy,
  modules,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly deployerAddress: Hex; // TODO: move this into WorldDeploy to reuse a world's deployer?
  readonly worldDeploy: WorldDeploy;
  readonly modules: readonly Module[];
}): Promise<readonly Hex[]> {
  if (!modules.length) return [];

  await ensureContractsDeployed({
    client,
    deployerAddress,
    contracts: uniqueBy(modules, (mod) => getAddress(mod.getAddress(deployerAddress))).map((mod) => ({
      bytecode: mod.bytecode,
      deployedBytecodeSize: mod.deployedBytecodeSize,
      label: `${mod.name} module`,
    })),
  });

  debug("installing modules:", modules.map((mod) => mod.name).join(", "));
  return (
    await Promise.all(
      modules.map((mod) =>
        pRetry(
          async () => {
            try {
              return mod.installAsRoot
                ? await writeContract(client, {
                    chain: client.chain ?? null,
                    address: worldDeploy.address,
                    abi: worldAbi,
                    // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
                    functionName: "installRootModule",
                    args: [mod.getAddress(deployerAddress), mod.installData],
                  })
                : await writeContract(client, {
                    chain: client.chain ?? null,
                    address: worldDeploy.address,
                    abi: worldAbi,
                    // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
                    functionName: "installModule",
                    args: [mod.getAddress(deployerAddress), mod.installData],
                  });
            } catch (error) {
              if (error instanceof BaseError && error.message.includes("Module_AlreadyInstalled")) {
                debug(`module ${mod.name} already installed`);
                return;
              }
              throw error;
            }
          },
          {
            retries: 3,
            onFailedAttempt: async (error) => {
              const delay = error.attemptNumber * 500;
              debug(`failed to install module ${mod.name}, retrying in ${delay}ms...`);
              await wait(delay);
            },
          },
        ),
      ),
    )
  ).filter(isDefined);
}
