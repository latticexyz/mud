import { Client, Transport, Chain, Account, Hex, BaseError } from "viem";
import { resourceToHex, writeContract } from "@latticexyz/common";
import { Module, WorldDeploy, worldAbi } from "./common";
import { debug } from "./debug";
import { isDefined } from "@latticexyz/common/utils";
import pRetry from "p-retry";
import { LibraryMap } from "./getLibraryMap";
import { ensureContractsDeployed } from "@latticexyz/common/internal";
import { encodeSystemCalls } from "@latticexyz/world/internal";

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

              const params = (() => {
                if (mod.installStrategy === "root") {
                  return {
                    functionName: "installRootModule",
                    args: [moduleAddress, mod.installData],
                  } as const;
                }

                if (mod.installStrategy === "delegation") {
                  return {
                    functionName: "batchCall",
                    args: encodeSystemCalls([
                      {
                        abi: registrationSystemAbi,
                        systemId: registrationSystemId,
                        functionName: "registerDelegation",
                        args: [moduleAddress, unlimitedDelegationControlId, "0x"],
                      },
                      {
                        abi: registrationSystemAbi,
                        systemId: registrationSystemId,
                        functionName: "installModule",
                        args: [moduleAddress, mod.installData],
                      },
                      {
                        abi: registrationSystemAbi,
                        systemId: registrationSystemId,
                        functionName: "unregisterDelegation",
                        args: [moduleAddress],
                      },
                    ]),
                  } as const;
                }

                return {
                  functionName: "installModule",
                  args: [moduleAddress, mod.installData],
                } as const;
              })();

              return await writeContract(client, {
                chain: client.chain ?? null,
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

// TODO: export from world
const unlimitedDelegationControlId = resourceToHex({ type: "system", namespace: "", name: "unlimited" });

// TODO: export from world
// world/src/modules/init/constants.sol
const registrationSystemId = resourceToHex({ type: "system", namespace: "", name: "Registration" });

// world/src/modules/init/RegistrationSystem.sol
const registrationSystemAbi = [
  {
    type: "function",
    name: "installModule",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "contract IModule",
      },
      {
        name: "encodedArgs",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "registerDelegation",
    inputs: [
      {
        name: "delegatee",
        type: "address",
        internalType: "address",
      },
      {
        name: "delegationControlId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "initCallData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unregisterDelegation",
    inputs: [
      {
        name: "delegatee",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
