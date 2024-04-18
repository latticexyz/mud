import { getRpcUrl } from "@latticexyz/common/foundry";
import { Hex } from "viem";
import { deployer } from "./deploy/ensureDeployer";
import { getWorldFactoryContracts } from "./deploy/getWorldFactoryContracts";
import { verifyContract } from "./verifyContract";
import PQueue from "p-queue";

type VerifyOptions = {
  foundryProfile?: string;
  verifier?: string;
  verifierUrl?: string;
  systems: { name: string; bytecode: Hex }[];
  modules: { name: string; bytecode: Hex }[];
  worldAddress: Hex;
};

export async function verify({
  foundryProfile = process.env.FOUNDRY_PROFILE,
  systems,
  modules,
  worldAddress,
  verifier,
  verifierUrl,
}: VerifyOptions): Promise<void> {
  const rpc = await getRpcUrl(foundryProfile);

  const verifyQueue = new PQueue({ concurrency: 1 });

  const tasks = [
    ...systems.map(
      ({ name, bytecode }) =>
        () =>
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
    ...Object.entries(getWorldFactoryContracts(deployer)).map(
      ([name, { bytecode }]) =>
        () =>
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
    ...modules.map(
      ({ name, bytecode }) =>
        () =>
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
    () =>
      verifyContract(
        { name: "World", rpc, verifier, verifierUrl, address: worldAddress },
        {
          profile: foundryProfile,
          cwd: "node_modules/@latticexyz/world",
        },
      ).catch((error) => {
        console.error(`Error verifying World contract:`, error);
      }),
  ];

  tasks.forEach((task) => verifyQueue.add(task));
}
