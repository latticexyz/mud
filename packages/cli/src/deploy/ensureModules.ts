import { Client, Transport, Chain, Account, Hex, BaseError } from "viem";
import { Module, WorldDeploy, worldAbi } from "./common";
import { debug } from "./debug";
import { isDefined } from "@latticexyz/common/utils";
import pRetry from "p-retry";
import { ensureContractsDeployed } from "./ensureContractsDeployed";
import { LibraryMap } from "./getLibraryMap";
import { getAction } from "viem/utils";
import { writeContract } from "viem/actions";

export async function ensureModules({
  client,
  deployerAddress,
  libraryMap,
  worldDeploy,
  modules,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly deployerAddress: Hex;
  readonly libraryMap: LibraryMap;
  readonly worldDeploy: WorldDeploy;
  readonly modules: readonly Module[];
}): Promise<readonly Hex[]> {
  if (!modules.length) return [];

  await ensureContractsDeployed({
    client,
    deployerAddress,
    contracts: modules.map((mod) => ({
      bytecode: mod.prepareDeploy(deployerAddress, libraryMap).bytecode,
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
              const moduleAddress = mod.prepareDeploy(deployerAddress, libraryMap).address;
              // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
              const params = mod.installAsRoot
                ? ({ functionName: "installRootModule", args: [moduleAddress, mod.installData] } as const)
                : ({ functionName: "installModule", args: [moduleAddress, mod.installData] } as const);
              return await getAction(
                client,
                writeContract,
                "writeContract",
              )({
                chain: client.chain ?? null,
                account: client.account,
                address: worldDeploy.address,
                abi,
                ...params,
              });
            } catch (error) {
              if (error instanceof BaseError && error.message.includes("Module_AlreadyInstalled")) {
                debug(`module ${mod.name} already installed`);
                return;
              }
              if (mod.optional) {
                debug(`optional module ${mod.name} install failed, skipping`);
                debug(error);
                return;
              }
              throw error;
            }
          },
          {
            retries: 3,
            onFailedAttempt: () => debug(`failed to install module ${mod.name}, retrying...`),
          },
        ),
      ),
    )
  ).filter(isDefined);
}
