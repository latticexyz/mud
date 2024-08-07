import { Client, Transport, Chain, Account, Hex, BaseError, Address } from "viem";
import { writeContract } from "@latticexyz/common";
import { Library, Module, worldAbi } from "./common";
import { isDefined, wait } from "@latticexyz/common/utils";
import pRetry from "p-retry";
import { ensureContractsDeployed } from "./ensureContractsDeployed";
import { debug } from "./debug";

export async function ensureModules({
  client,
  deployerAddress,
  libraries,
  worldAddress,
  modules,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly deployerAddress: Hex;
  readonly libraries: readonly Library[];
  readonly worldAddress: Address;
  readonly modules: readonly Module[];
}): Promise<readonly Hex[]> {
  if (!modules.length) return [];

  await ensureContractsDeployed({
    client,
    deployerAddress,
    contracts: modules.map((mod) => ({
      bytecode: mod.prepareDeploy(deployerAddress, libraries).bytecode,
      deployedBytecodeSize: mod.deployedBytecodeSize,
      debugLabel: `${mod.name} module`,
    })),
  });

  debug("installing modules:", modules.map((mod) => mod.name).join(", "));
  return (
    await Promise.all(
      modules.map((mod) =>
        pRetry(
          async () => {
            try {
              // append module's ABI so that we can decode any custom errors
              const abi = [...worldAbi, ...mod.abi];
              const moduleAddress = mod.prepareDeploy(deployerAddress, libraries).address;
              return mod.installAsRoot
                ? await writeContract(client, {
                    chain: client.chain ?? null,
                    address: worldAddress,
                    abi,
                    // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
                    functionName: "installRootModule",
                    args: [moduleAddress, mod.installData],
                  })
                : await writeContract(client, {
                    chain: client.chain ?? null,
                    address: worldAddress,
                    abi,
                    // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
                    functionName: "installModule",
                    args: [moduleAddress, mod.installData],
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
