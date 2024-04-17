import { forge, getRpcUrl } from "@latticexyz/common/foundry";
import { Hex, getCreate2Address } from "viem";
import { salt } from "./deploy/common";
import { deployer } from "./deploy/ensureDeployer";
import { MUDError } from "@latticexyz/common/errors";
import { getWorldFactoryContracts } from "./deploy/ensureWorldFactory";
import { Contract } from "./deploy/ensureContract";

type VerifyOptions = {
  foundryProfile?: string;
  verifier?: string;
  systems: Contract[];
  modules: Contract[];
  worldAddress: Hex;
};

async function verifyContractUnderlying(
  system: Hex,
  label: string,
  rpc: string,
  foundryProfile?: string,
  cwd?: string,
  verifier?: string,
) {
  if (verifier) {
    await forge(["verify-contract", system, label, "--rpc-url", rpc, "--verifier", verifier], {
      profile: foundryProfile,
      cwd,
    });
  } else {
    await forge(["verify-contract", system, label, "--rpc-url", rpc], {
      profile: foundryProfile,
      cwd,
    });
  }
}

async function verifyContract(
  deployerAddress: Hex,
  contract: Contract,
  rpc: string,
  verifier?: string,
  foundryProfile?: string,
  cwd?: string,
) {
  if (!contract.label) {
    throw new MUDError("Need a label");
  }

  const system = getCreate2Address({ from: deployerAddress, bytecode: contract.bytecode, salt });

  return verifyContractUnderlying(system, contract.label, rpc, foundryProfile, cwd, verifier);
}

export async function verify({
  foundryProfile = process.env.FOUNDRY_PROFILE,
  systems,
  modules,
  worldAddress,
  verifier,
}: VerifyOptions): Promise<void> {
  const rpc = await getRpcUrl(foundryProfile);

  await Promise.all(systems.map((contract) => verifyContract(deployer, contract, rpc, verifier, foundryProfile)));

  await Promise.all(
    getWorldFactoryContracts(deployer).map((contract) =>
      verifyContract(deployer, contract, rpc, verifier, foundryProfile, "node_modules/@latticexyz/world"),
    ),
  );

  await Promise.all(
    modules.map((contract) =>
      verifyContract(deployer, contract, rpc, verifier, foundryProfile, "node_modules/@latticexyz/world-modules"),
    ),
  );

  verifyContractUnderlying(worldAddress, "World", rpc, verifier, "node_modules/@latticexyz/world");
}
