import { getRpcUrl } from "@latticexyz/common/foundry";
import { Hex } from "viem";
import { getWorldFactoryContracts } from "./deploy/getWorldFactoryContracts";
import { verifyContract } from "./verifyContract";
import PQueue from "p-queue";
import { getWorldProxyFactoryContracts } from "./deploy/getWorldProxyFactoryContracts";
import { deployer } from "./deploy/ensureDeployer";

type VerifyOptions = {
  foundryProfile?: string;
  verifier?: string;
  verifierUrl?: string;
  systems: { name: string; bytecode: Hex }[];
  modules: { name: string; bytecode: Hex }[];
  worldAddress: Hex;
  /**
   * Address of determinstic deployment proxy: https://github.com/Arachnid/deterministic-deployment-proxy
   * By default, we look for a deployment at 0x4e59b44847b379578588920ca78fbf26c0b4956c and, if not, deploy one.
   * If the target chain does not support legacy transactions, we deploy the proxy bytecode anyway, but it will
   * not have a deterministic address.
   */
  deployerAddress?: Hex;
  useProxy?: boolean;
};

export async function verify({
  foundryProfile = process.env.FOUNDRY_PROFILE,
  systems,
  modules,
  worldAddress,
  deployerAddress: initialDeployerAddress,
  verifier,
  verifierUrl,
  useProxy,
}: VerifyOptions): Promise<void> {
  const deployerAddress = initialDeployerAddress ?? deployer;

  const rpc = await getRpcUrl(foundryProfile);

  const verifyQueue = new PQueue({ concurrency: 1 });

  systems.map(({ name, bytecode }) =>
    verifyQueue.add(() =>
      verifyContract(
        {
          name,
          rpc,
          verifier,
          verifierUrl,
          from: deployerAddress,
          bytecode,
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
          from: deployerAddress,
          bytecode,
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
          from: deployerAddress,
          bytecode,
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
