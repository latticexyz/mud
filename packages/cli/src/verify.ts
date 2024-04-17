import { forge, getRpcUrl } from "@latticexyz/common/foundry";
import { Hex, getCreate2Address } from "viem";
import { salt } from "./deploy/common";
import { deployer } from "./deploy/ensureDeployer";
import { MUDError } from "@latticexyz/common/errors";
import { getWorldFactoryContracts } from "./deploy/ensureWorldFactory";
import { Contract } from "./deploy/ensureContract";

type VerifyOptions = {
  foundryProfile?: string;
  systems: Contract[];
  modules: Contract[];
  worldAddress?: Hex;
};

async function verifyContract(
  foundryProfile: string | undefined,
  deployerAddress: Hex,
  contract: Contract,
  rpc: string,
  cwd?: string,
) {
  if (!contract.label) {
    throw new MUDError("Need a label");
  }

  const system = getCreate2Address({ from: deployerAddress, bytecode: contract.bytecode, salt });

  await forge(["verify-contract", system, contract.label, "--verifier", "sourcify", "--rpc-url", rpc], {
    profile: foundryProfile,
    cwd,
  });
}

export async function verify({
  foundryProfile = process.env.FOUNDRY_PROFILE,
  systems,
  modules,
  worldAddress,
}: VerifyOptions): Promise<void> {
  const rpc = await getRpcUrl(foundryProfile);

  await Promise.all(systems.map((contract) => verifyContract(foundryProfile, deployer, contract, rpc)));

  await Promise.all(
    getWorldFactoryContracts(deployer).map((contract) =>
      verifyContract(foundryProfile, deployer, contract, rpc, "node_modules/@latticexyz/world"),
    ),
  );

  await Promise.all(
    modules.map((contract) =>
      verifyContract(foundryProfile, deployer, contract, rpc, "node_modules/@latticexyz/world-modules"),
    ),
  );

  if (worldAddress) {
    await forge(["verify-contract", worldAddress, "World", "--verifier", "sourcify", "--rpc-url", rpc], {
      profile: foundryProfile,
      cwd: "node_modules/@latticexyz/world",
    });
  }
}
