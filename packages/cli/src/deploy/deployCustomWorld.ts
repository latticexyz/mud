import { Account, Chain, Client, Hex, Transport, concatHex, encodeDeployData, isHex } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { resourceToHex, sendTransaction, writeContract } from "@latticexyz/common";
import { debug } from "./debug";
import { logsToWorldDeploy } from "./logsToWorldDeploy";
import { WorldDeploy, worldAbi } from "./common";
import { getWorldContracts } from "./getWorldContracts";
import { ensureContractsDeployed, getContractAddress, waitForTransactions } from "@latticexyz/common/internal";
import { ContractArtifact, ReferenceIdentifier } from "@latticexyz/world/node";
import { World } from "@latticexyz/world";

function findArtifact(ref: ReferenceIdentifier, artifacts: readonly ContractArtifact[]): ContractArtifact {
  const artifact = artifacts.find((a) => a.sourcePath === ref.sourcePath && a.name === ref.name);
  if (!artifact) throw new Error(`Could not find referenced artifact at "${ref.sourcePath}:${ref.name}".`);
  return artifact;
}

function getDependencies(
  artifact: ContractArtifact,
  artifacts: readonly ContractArtifact[],
): readonly ContractArtifact[] {
  return artifact.bytecode
    .filter((part): part is Exclude<typeof part, Hex> => !isHex(part))
    .flatMap((ref) => {
      return getDependencies(findArtifact(ref, artifacts), artifacts);
    });
}

function getDeployable(deployerAddress: Hex, artifact: ContractArtifact, artifacts: readonly ContractArtifact[]): Hex {
  return concatHex(
    artifact.bytecode.map((ref): Hex => {
      if (isHex(ref)) return ref;
      return getContractAddress({
        deployerAddress,
        bytecode: getDeployable(deployerAddress, findArtifact(ref, artifacts), artifacts),
      });
    }),
  );
}

export async function deployCustomWorld({
  client,
  deployerAddress,
  artifacts,
  customWorld,
}: {
  client: Client<Transport, Chain | undefined, Account>;
  deployerAddress: Hex;
  artifacts: readonly ContractArtifact[];
  customWorld: Exclude<World["deploy"]["customWorld"], undefined>;
}): Promise<WorldDeploy> {
  // deploy world prereqs (e.g. core modules)
  const contracts = getWorldContracts(deployerAddress);
  await ensureContractsDeployed({
    client,
    deployerAddress,
    contracts: Object.values(contracts),
  });

  const worldArtifact = findArtifact(customWorld, artifacts);
  // TODO: check that world ABI still satisfies the protocol (https://github.com/latticexyz/mud/issues/3152)

  // Find and deploy dependencies (i.e. public libraries)
  const deps = getDependencies(worldArtifact, artifacts);
  if (deps.length) {
    debug(`deploying ${deps.length} world dependencies`);
    await ensureContractsDeployed({
      client,
      deployerAddress,
      contracts: deps
        .map((dep) => getDeployable(deployerAddress, dep, artifacts))
        .reverse()
        .map((bytecode) => ({ bytecode })),
    });
  }

  // Deploy custom world without deterministic deployer for now
  debug("deploying custom world");
  const deployTx = await sendTransaction(client, {
    chain: client.chain ?? null,
    data: encodeDeployData({
      abi: worldArtifact.abi,
      args: [], // TODO (https://github.com/latticexyz/mud/issues/3150)
      bytecode: getDeployable(deployerAddress, worldArtifact, artifacts),
    }),
  });

  debug("waiting for custom world deploy");
  const receipt = await waitForTransactionReceipt(client, { hash: deployTx });
  if (receipt.status !== "success") {
    console.error("world deploy failed", receipt);
    throw new Error("world deploy failed");
  }

  const deploy = logsToWorldDeploy(receipt.logs);
  debug("deployed custom world to", deploy.address, "at block", deploy.deployBlock);

  // initialize world via init module
  const initTx = await writeContract(client, {
    chain: client.chain ?? null,
    address: deploy.address,
    abi: worldAbi,
    functionName: "initialize",
    args: [contracts.InitModule.address],
  });
  await waitForTransactions({ client, hashes: [initTx], debugLabel: "world init" });

  // transfer root namespace to deployer after init module is installed so `transferOwnership` method is available
  const transferOwnershipTx = await writeContract(client, {
    chain: client.chain ?? null,
    address: deploy.address,
    abi: worldAbi,
    functionName: "transferOwnership",
    args: [resourceToHex({ type: "namespace", namespace: "", name: "" }), client.account.address],
  });
  await waitForTransactions({ client, hashes: [transferOwnershipTx], debugLabel: "world ownership transfer" });

  return { ...deploy, stateBlock: deploy.deployBlock };
}
