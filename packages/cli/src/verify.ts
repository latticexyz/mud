import { getRpcUrl } from "@latticexyz/common/foundry";
import { Hex } from "viem";
import { deployer } from "./deploy/ensureDeployer";
import { getWorldFactoryContracts } from "./deploy/getWorldFactoryContracts";
import { verifyContract } from "./verifyContract";
import PQueue from "p-queue";
import { getWorldProxyFactoryContracts } from "./deploy/getWorldProxyFactoryContracts";

type VerifyOptions = {
  foundryProfile?: string;
  verifier?: string;
  verifierUrl?: string;
  systems: { name: string; bytecode: Hex }[];
  modules: { name: string; bytecode: Hex }[];
  worldAddress: Hex;
  useProxy?: boolean;
};

export async function verify({
  foundryProfile = process.env.FOUNDRY_PROFILE,
  systems,
  modules,
  worldAddress,
  verifier,
  verifierUrl,
  useProxy,
}: VerifyOptions): Promise<void> {
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
          from: deployer,
          bytecode,
        },
        { profile: foundryProfile },
      ).catch((error) => {
        console.error(`Error verifying system contract ${name}:`, error);
      }),
    ),
  );

  Object.entries(useProxy ? getWorldProxyFactoryContracts(deployer) : getWorldFactoryContracts(deployer)).map(
    ([name, { bytecode }]) =>
      verifyQueue.add(() =>
        verifyContract(
          {
            name,
            rpc,
            verifier,
            verifierUrl,
            from: deployer,
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
          from: deployer,
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
