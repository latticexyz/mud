import { getRpcUrl } from "@latticexyz/common/foundry";
import { Hex } from "viem";
import { deployer } from "./deploy/ensureDeployer";
import { getWorldFactoryContracts } from "./deploy/getWorldFactoryContracts";
import { verifyContract, verifyContractCreate2DefaultSalt } from "./verifyContract";

type VerifyOptions = {
  foundryProfile?: string;
  verifier?: string;
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
}: VerifyOptions): Promise<void> {
  const rpc = await getRpcUrl(foundryProfile);

  await Promise.all(
    systems.map(({ name, bytecode }) =>
      verifyContractCreate2DefaultSalt(
        {
          name,
          from: deployer,
          bytecode,
          rpc,
          verifier,
        },
        { profile: foundryProfile },
      ),
    ),
  );

  await Promise.all(
    Object.entries(getWorldFactoryContracts(deployer)).map(([name, { bytecode }]) =>
      verifyContractCreate2DefaultSalt(
        {
          name,
          from: deployer,
          bytecode,
          rpc,
          verifier,
        },
        {
          profile: foundryProfile,
          cwd: "node_modules/@latticexyz/world",
        },
      ),
    ),
  );

  await Promise.all(
    modules.map(({ name, bytecode }) =>
      verifyContractCreate2DefaultSalt(
        {
          name: name,
          from: deployer,
          bytecode: bytecode,
          rpc,
          verifier,
        },
        {
          profile: foundryProfile,
          cwd: "node_modules/@latticexyz/world-modules",
        },
      ),
    ),
  );

  verifyContract(
    { name: "World", address: worldAddress, rpc, verifier },
    {
      profile: foundryProfile,
      cwd: "node_modules/@latticexyz/world",
    },
  );
}
