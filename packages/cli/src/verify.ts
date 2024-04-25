import { Chain, Client, Hex, Transport, createPublicClient, getCreate2Address, http, sliceHex, zeroHash } from "viem";
import { getWorldFactoryContracts } from "./deploy/getWorldFactoryContracts";
import { verifyContract } from "./verify/verifyContract";
import PQueue from "p-queue";
import { getWorldProxyFactoryContracts } from "./deploy/getWorldProxyFactoryContracts";
import { getDeployer } from "./deploy/getDeployer";
import { MUDError } from "@latticexyz/common/errors";
import { salt } from "./deploy/common";

type VerifyOptions = {
  client: Client<Transport, Chain | undefined>;
  rpc: string;
  foundryProfile?: string;
  verifier?: string;
  verifierUrl?: string;
  systems: { name: string; bytecode: Hex }[];
  modules: { name: string; bytecode: Hex }[];
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
  foundryProfile = process.env.FOUNDRY_PROFILE,
  systems,
  modules,
  worldAddress,
  deployerAddress: initialDeployerAddress,
  verifier,
  verifierUrl,
}: VerifyOptions): Promise<void> {
  const deployerAddress = initialDeployerAddress ?? (await getDeployer(client));
  if (!deployerAddress) {
    throw new MUDError(`No deployer`);
  }

  const publicClient = createPublicClient({
    transport: http(rpc),
  });

  // If the proxy implementation storage slot is set on the World, the World was deployed as a proxy.
  const implementationStorage = await publicClient.getStorageAt({
    address: worldAddress,
    slot: ERC1967_IMPLEMENTATION_SLOT,
  });
  const useProxy = implementationStorage && implementationStorage !== zeroHash;

  const verifyQueue = new PQueue({ concurrency: 1 });

  systems.map(({ name, bytecode }) =>
    verifyQueue.add(() =>
      verifyContract(
        {
          name,
          rpc,
          verifier,
          verifierUrl,
          address: getCreate2Address({
            from: deployerAddress,
            bytecode: bytecode,
            salt,
          }),
        },
        { profile: foundryProfile },
      ).catch((error) => {
        console.error(`Error verifying system contract ${name}:`, error);
      }),
    ),
  );

  Object.entries(
    useProxy ? getWorldProxyFactoryContracts(deployerAddress) : getWorldFactoryContracts(deployerAddress),
  ).map(([name, { bytecode }]) =>
    verifyQueue.add(() =>
      verifyContract(
        {
          name,
          rpc,
          verifier,
          verifierUrl,
          address: getCreate2Address({
            from: deployerAddress,
            bytecode: bytecode,
            salt,
          }),
        },
        {
          profile: foundryProfile,
          cwd: "node_modules/@latticexyz/world",
        },
      ).catch((error) => {
        console.error(`Error verifying world factory contract ${name}:`, error);
      }),
    ),
  );

  modules.map(({ name, bytecode }) =>
    verifyQueue.add(() =>
      verifyContract(
        {
          name: name,
          rpc,
          verifier,
          verifierUrl,
          address: getCreate2Address({
            from: deployerAddress,
            bytecode: bytecode,
            salt,
          }),
        },
        {
          profile: foundryProfile,
          cwd: "node_modules/@latticexyz/world-modules",
        },
      ).catch((error) => {
        console.error(`Error verifying module contract ${name}:`, error);
      }),
    ),
  );

  // If the world was deployed as a Proxy, verify the proxy and implementation.
  if (useProxy) {
    const implementationAddress = sliceHex(implementationStorage, -20);

    verifyQueue.add(() =>
      verifyContract(
        { name: "WorldProxy", rpc, verifier, verifierUrl, address: worldAddress },
        {
          profile: foundryProfile,
          cwd: "node_modules/@latticexyz/world",
        },
      ).catch((error) => {
        console.error(`Error verifying WorldProxy contract:`, error);
      }),
    );

    verifyQueue.add(() =>
      verifyContract(
        { name: "World", rpc, verifier, verifierUrl, address: implementationAddress },
        {
          profile: foundryProfile,
          cwd: "node_modules/@latticexyz/world",
        },
      ).catch((error) => {
        console.error(`Error verifying World contract:`, error);
      }),
    );
  } else {
    verifyQueue.add(() =>
      verifyContract(
        { name: "World", rpc, verifier, verifierUrl, address: worldAddress },
        {
          profile: foundryProfile,
          cwd: "node_modules/@latticexyz/world",
        },
      ).catch((error) => {
        console.error(`Error verifying World contract:`, error);
      }),
    );
  }
}
