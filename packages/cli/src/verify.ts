import { Chain, Client, Hex, Transport, getCreate2Address, sliceHex, zeroHash } from "viem";
import { getWorldFactoryContracts } from "./deploy/getWorldFactoryContracts";
import { verifyContract } from "./verify/verifyContract";
import PQueue from "p-queue";
import { getWorldProxyFactoryContracts } from "./deploy/getWorldProxyFactoryContracts";
import { getDeployer } from "./deploy/getDeployer";
import { MUDError } from "@latticexyz/common/errors";
import { Module, salt } from "./deploy/common";
import { getStorageAt } from "viem/actions";
import { execa } from "execa";

type VerifyOptions = {
  client: Client<Transport, Chain | undefined>;
  rpc: string;
  verifier: string;
  verifierUrl?: string;
  systems: { name: string; bytecode: Hex }[];
  modules: readonly Module[];
  worldAddress: Hex;
  /**
   * Address of determinstic deployment proxy: https://github.com/Arachnid/deterministic-deployment-proxy
   * By default, we look for a deployment at 0x4e59b44847b379578588920ca78fbf26c0b4956c.
   * If it is not deployed or the target chain does not support legacy transactions, the user must set the deployer manually.
   */
  deployerAddress?: Hex;
};

const ERC1967_IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

export async function verify({
  client,
  rpc,
  systems,
  modules,
  worldAddress,
  deployerAddress: initialDeployerAddress,
  verifier,
  verifierUrl,
}: VerifyOptions): Promise<void> {
  const deployerAddress = initialDeployerAddress ?? (await getDeployer(client));
  if (!deployerAddress) {
    throw new MUDError("No deployer address provided or found.");
  }

  // If the proxy implementation storage slot is set on the World, the World was deployed as a proxy.
  const implementationStorage = await getStorageAt(client, {
    address: worldAddress,
    slot: ERC1967_IMPLEMENTATION_SLOT,
  });
  const usesProxy = implementationStorage && implementationStorage !== zeroHash;

  const verifyQueue = new PQueue({ concurrency: 4 });

  systems.map(({ name, bytecode }) =>
    verifyQueue.add(() =>
      verifyContract({
        name,
        rpc,
        verifier,
        verifierUrl,
        address: getCreate2Address({
          from: deployerAddress,
          bytecode: bytecode,
          salt,
        }),
      }).catch((error) => {
        console.error(`Error verifying system contract ${name}:`, error);
      }),
    ),
  );

  // If the verifier is Sourcify, attempt to verify MUD core contracts
  // There are path issues with verifying Blockscout and Etherscan
  if (verifier === "sourcify") {
    // Install subdependencies so contracts can compile
    await execa("npm", ["install"], {
      cwd: "node_modules/@latticexyz/store",
    });
    await execa("npm", ["install"], {
      cwd: "node_modules/@latticexyz/world",
    });
    await execa("npm", ["install"], {
      cwd: "node_modules/@latticexyz/world-modules",
    });

    Object.entries(
      usesProxy ? getWorldProxyFactoryContracts(deployerAddress) : getWorldFactoryContracts(deployerAddress),
    ).map(([name, { bytecode }]) =>
      verifyQueue.add(() =>
        verifyContract({
          cwd: "node_modules/@latticexyz/world",
          name,
          rpc,
          verifier,
          verifierUrl,
          address: getCreate2Address({
            from: deployerAddress,
            bytecode: bytecode,
            salt,
          }),
        }).catch((error) => {
          console.error(`Error verifying world factory contract ${name}:`, error);
        }),
      ),
    );

    modules.map(({ name, prepareDeploy }) => {
      const { address } = prepareDeploy(deployerAddress, {});
      return verifyQueue.add(() =>
        verifyContract({
          // TODO: figure out dir from artifactPath via import.meta.resolve?
          cwd: "node_modules/@latticexyz/world-modules",
          name,
          rpc,
          verifier,
          verifierUrl,
          address,
        }).catch((error) => {
          console.error(`Error verifying module contract ${name}:`, error);
        }),
      );
    });

    // If the world was deployed as a Proxy, verify the proxy and implementation.
    if (usesProxy) {
      const implementationAddress = sliceHex(implementationStorage, -20);

      verifyQueue.add(() =>
        verifyContract({
          cwd: "node_modules/@latticexyz/world",
          name: "WorldProxy",
          rpc,
          verifier,
          verifierUrl,
          address: worldAddress,
        }).catch((error) => {
          console.error(`Error verifying WorldProxy contract:`, error);
        }),
      );

      verifyQueue.add(() =>
        verifyContract({
          cwd: "node_modules/@latticexyz/world",
          name: "World",
          rpc,
          verifier,
          verifierUrl,
          address: implementationAddress,
        }).catch((error) => {
          console.error(`Error verifying World contract:`, error);
        }),
      );
    } else {
      verifyQueue.add(() =>
        verifyContract({
          cwd: "node_modules/@latticexyz/world",
          name: "World",
          rpc,
          verifier,
          verifierUrl,
          address: worldAddress,
        }).catch((error) => {
          console.error(`Error verifying World contract:`, error);
        }),
      );
    }
  } else {
    console.log("");
    console.log(
      `Note: MUD is currently unable to verify store, world, and world-modules contracts with ${verifier}. We are planning to expand support in a future version.`,
    );
    console.log("");
  }
}
