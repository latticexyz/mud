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

async function verifyContract(
  address: Hex,
  label: string,
  rpc: string,
  verifier?: string,
  foundryProfile?: string,
  cwd?: string,
) {
  if (verifier) {
    await forge(["verify-contract", address, label, "--rpc-url", rpc, "--verifier", verifier], {
      profile: foundryProfile,
      cwd,
    });
  } else {
    await forge(["verify-contract", address, label, "--rpc-url", rpc], {
      profile: foundryProfile,
      cwd,
    });
  }
}

async function verifyContractFromBytecode(
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

  const address = getCreate2Address({ from: deployerAddress, bytecode: contract.bytecode, salt });

  return verifyContract(address, contract.label, rpc, verifier, foundryProfile, cwd);
}

export async function verify({
  foundryProfile = process.env.FOUNDRY_PROFILE,
  systems,
  modules,
  worldAddress,
  verifier,
}: VerifyOptions): Promise<void> {
  const rpc = await getRpcUrl(foundryProfile);

  await Promise.all(
    systems.map((contract) => verifyContractFromBytecode(deployer, contract, rpc, verifier, foundryProfile)),
  );

  await Promise.all(
    Object.values(getWorldFactoryContracts(deployer)).map((contract) =>
      verifyContractFromBytecode(deployer, contract, rpc, verifier, foundryProfile, "node_modules/@latticexyz/world"),
    ),
  );

  await Promise.all(
    modules.map((contract) =>
      verifyContractFromBytecode(
        deployer,
        contract,
        rpc,
        verifier,
        foundryProfile,
        "node_modules/@latticexyz/world-modules",
      ),
    ),
  );

  verifyContract(worldAddress, "World", rpc, verifier, "node_modules/@latticexyz/world");
}
